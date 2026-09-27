import { Injectable, Logger } from '@nestjs/common';
import type { Profile, User } from '@prisma/client';
import { Database } from '@/infra/db';
import {
  socialMediasOf,
  withMissingContacts,
} from '@/modules/clients/utils/contact-points';

/// See docs/specs/art/order-a-commission/prd.md, "Claiming on Google login".
@Injectable()
export class IdentityClaimService {
  private readonly logger = new Logger(IdentityClaimService.name);

  constructor(private readonly db: Database) {}

  async claimFor(user: User): Promise<void> {
    try {
      await this.claim(user);
    } catch (error) {
      this.logger.warn(`Identity claim failed for user ${user.id}: ${error}`);
    }
  }

  private async claim(user: User): Promise<void> {
    const client = await this.db.client.findFirst({
      where: { email: { equals: user.email, mode: 'insensitive' } },
      include: { profile: true },
    });
    if (!client) return;

    if (!client.userId) {
      const linked = await this.db.client.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!linked) {
        await this.db.client.update({
          where: { id: client.id },
          data: { userId: user.id },
        });
      }
    }

    const profile = client.profile;
    if (!profile || profile.userId) return;

    const own = await this.db.profile.findUnique({
      where: { userId: user.id },
    });
    if (!own) {
      await this.db.profile.update({
        where: { id: profile.id },
        data: { userId: user.id },
      });
      return;
    }

    await this.mergeInto(own, profile);
  }

  private async mergeInto(own: Profile, unclaimed: Profile): Promise<void> {
    await this.db.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: own.id },
        data: {
          socialMedias: withMissingContacts(
            socialMediasOf(own.socialMedias),
            socialMediasOf(unclaimed.socialMedias),
          ),
        },
      });
      await tx.client.updateMany({
        where: { profileId: unclaimed.id },
        data: { profileId: own.id },
      });

      const birthday = await tx.birthday.findUnique({
        where: { profileId: unclaimed.id },
        select: { id: true },
      });
      if (!unclaimed.addedById && !birthday) {
        await tx.profile.delete({ where: { id: unclaimed.id } });
      }
    });
  }
}
