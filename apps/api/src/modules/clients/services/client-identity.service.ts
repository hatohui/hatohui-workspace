import { BadRequestException, Injectable } from '@nestjs/common';
import type { Client, Prisma, Profile, User } from '@prisma/client';
import { Database } from '@/infra/db';
import { generateUniqueHandle } from '@/modules/users/utils/handle.util';
import { IDENTITY_MATCH_LIMIT } from '@/modules/clients/clients.constants';
import {
  CommissionIdentityDto,
  MatchCommissionIdentityDto,
  MyCommissionIdentityDto,
} from '@/modules/clients/dto/commission-identity.dto';
import {
  contactMethodFor,
  isEmailContact,
  socialMediasOf,
  toContactPoints,
  type ContactPoint,
} from '@/modules/clients/utils/contact-points';

export interface CommissionIdentityInput {
  clientName?: string;
  clientEmail?: string;
  clientHandle?: string;
  matchedProfileId?: string;
  contact: ContactPoint;
}

export interface ResolvedCommissionIdentity {
  client: Client;
  contact: ContactPoint;
}

@Injectable()
export class ClientIdentityService {
  constructor(private readonly db: Database) {}

  async match(
    dto: MatchCommissionIdentityDto,
  ): Promise<CommissionIdentityDto[]> {
    const email = dto.email?.trim().toLowerCase();
    const handle = dto.handle?.trim().toLowerCase();
    const name = dto.name?.trim();

    const conditions: Prisma.ProfileWhereInput[] = [];
    if (email) {
      conditions.push({
        clients: { some: { email: { equals: email, mode: 'insensitive' } } },
      });
    }
    if (handle) conditions.push({ handle });
    if (name) {
      conditions.push({ displayName: { equals: name, mode: 'insensitive' } });
    }
    if (conditions.length === 0) return [];

    const profiles = await this.db.profile.findMany({
      where: { OR: conditions },
      take: IDENTITY_MATCH_LIMIT,
      orderBy: { createdAt: 'asc' },
    });
    return profiles.map(toCommissionIdentityDto);
  }

  async mine(user: User): Promise<MyCommissionIdentityDto> {
    const profile = await this.db.profile.findUnique({
      where: { userId: user.id },
    });
    return {
      email: user.email,
      identity: profile ? toCommissionIdentityDto(profile) : null,
    };
  }

  async resolve(
    input: CommissionIdentityInput,
    submitter: User | null,
  ): Promise<ResolvedCommissionIdentity> {
    if (submitter) return this.resolveForAccount(input, submitter);
    return this.resolveAnonymous(input);
  }

  private async resolveForAccount(
    input: CommissionIdentityInput,
    user: User,
  ): Promise<ResolvedCommissionIdentity> {
    const contact = withEmailValue(input.contact, user.email);
    const profile = await this.db.profile.findUnique({
      where: { userId: user.id },
    });
    if (profile && !isEmailContact(contact)) {
      await this.db.profile.update({
        where: { id: profile.id },
        data: {
          socialMedias: {
            ...socialMediasOf(profile.socialMedias),
            [contact.platform]: contact.value,
          },
        },
      });
    }

    const data = {
      name: profile?.displayName ?? user.name,
      ...legacyContactFields(contact),
      profileId: profile?.id ?? null,
    };
    const linked = await this.db.client.findUnique({
      where: { userId: user.id },
    });
    const client = linked
      ? await this.db.client.update({ where: { id: linked.id }, data })
      : await this.db.client.upsert({
          where: { email: user.email },
          update: { ...data, userId: user.id },
          create: { ...data, email: user.email, userId: user.id },
        });
    return { client, contact };
  }

  private async resolveAnonymous(
    input: CommissionIdentityInput,
  ): Promise<ResolvedCommissionIdentity> {
    const name = input.clientName?.trim();
    const email = input.clientEmail?.trim();
    if (!name || !email) {
      throw new BadRequestException(
        'clientName and clientEmail are required when not signed in',
      );
    }
    const contact = withEmailValue(input.contact, email);

    const existing = await this.db.client.findUnique({ where: { email } });
    const profile = await this.profileForAnonymous(
      input,
      name,
      contact,
      existing?.profileId ?? null,
    );

    const data = { name, ...legacyContactFields(contact) };
    const client = await this.db.client.upsert({
      where: { email },
      update: { ...data, profileId: existing?.profileId ?? profile.id },
      create: { ...data, email, profileId: profile.id },
    });
    return { client, contact };
  }

  private async profileForAnonymous(
    input: CommissionIdentityInput,
    name: string,
    contact: ContactPoint,
    existingProfileId: string | null,
  ): Promise<Profile> {
    const matchedId = input.matchedProfileId ?? existingProfileId;
    const matched = matchedId
      ? await this.db.profile.findUnique({ where: { id: matchedId } })
      : null;
    if (matched) return this.addContactIfMissing(matched, contact);

    const handle = await generateUniqueHandle(
      this.db,
      input.clientHandle?.trim() || name,
    );
    return this.db.profile.create({
      data: {
        displayName: name,
        handle,
        socialMedias: isEmailContact(contact)
          ? undefined
          : { [contact.platform]: contact.value },
      },
    });
  }

  private async addContactIfMissing(
    profile: Profile,
    contact: ContactPoint,
  ): Promise<Profile> {
    const socialMedias = socialMediasOf(profile.socialMedias);
    if (
      profile.userId ||
      isEmailContact(contact) ||
      socialMedias[contact.platform]
    ) {
      return profile;
    }
    return this.db.profile.update({
      where: { id: profile.id },
      data: {
        socialMedias: { ...socialMedias, [contact.platform]: contact.value },
      },
    });
  }
}

export function toCommissionIdentityDto(
  profile: Profile,
): CommissionIdentityDto {
  return {
    profileId: profile.id,
    displayName: profile.displayName,
    handle: profile.handle,
    avatarUrl: profile.avatarUrl,
    contacts: toContactPoints(socialMediasOf(profile.socialMedias)),
  };
}

function withEmailValue(contact: ContactPoint, email: string): ContactPoint {
  return isEmailContact(contact) ? { ...contact, value: email } : contact;
}

function legacyContactFields(contact: ContactPoint) {
  return {
    preferredContactMethod: contactMethodFor(contact.platform),
    contactHandle: isEmailContact(contact) ? null : contact.value,
  };
}
