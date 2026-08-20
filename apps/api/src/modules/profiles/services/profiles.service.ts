import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendVisibility, Prisma } from '@prisma/client';
import type { User } from '@prisma/client';
import { Database } from '@/infra/db';
import { Cache, CACHE_KEYS } from '@/infra/cache';
import { Storage } from '@/infra/storage';
import { avatarKeyFor, isStagedKey } from '@/common/utils/asset-paths';
import { AvatarsService } from '@/modules/avatars/services/avatars.service';
import { AvatarVersionsDto } from '@/modules/avatars/dto/avatar-version.dto';
import { ConnectionsService } from '@/modules/connections/services/connections.service';
import {
  CreateFriendDto,
  FriendDto,
  UpdateFriendDto,
} from '@/modules/profiles/dto/friend.dto';
import { PaginatedFriendsDto } from '@/modules/profiles/dto/friend-search.dto';
import { validateBirthdayInput } from '@/modules/profiles/utils/birthday-visibility';
import {
  canEditProfile,
  PROFILE_INCLUDE,
  toFriendDto,
  type ProfileWithBirthday,
} from '@/modules/profiles/utils/profile.mapper';
import { ViewerContextService } from '@/modules/viewer-context/services/viewer-context.service';

function nameSearchWhere(query: string | undefined): Prisma.ProfileWhereInput {
  const needle = query?.trim();
  if (!needle) return {};
  return {
    OR: [
      { displayName: { contains: needle, mode: 'insensitive' } },
      { handle: { contains: needle, mode: 'insensitive' } },
    ],
  };
}

/// Shapes the nested Birthday write for a profile create/update. A missing row
/// means "no birthday known", so the row is only created once a date arrives.
function birthdayWriteFor(
  dto: CreateFriendDto | UpdateFriendDto,
  hasExisting: boolean,
): Prisma.BirthdayUpdateOneWithoutProfileNestedInput | undefined {
  if (dto.birthMonth !== undefined && dto.birthDay !== undefined) {
    return {
      upsert: {
        create: {
          year: dto.birthYear ?? null,
          month: dto.birthMonth,
          day: dto.birthDay,
          visibility: dto.visibility ?? FriendVisibility.PUBLIC,
        },
        update: {
          year: dto.birthYear,
          month: dto.birthMonth,
          day: dto.birthDay,
          visibility: dto.visibility,
        },
      },
    };
  }

  // Visibility on its own can only apply to a birthday that already exists.
  if (dto.visibility !== undefined && hasExisting) {
    return { update: { visibility: dto.visibility } };
  }

  return undefined;
}

@Injectable()
export class ProfilesService {
  constructor(
    private readonly db: Database,
    private readonly cache: Cache,
    private readonly storage: Storage,
    private readonly avatars: AvatarsService,
    private readonly connections: ConnectionsService,
    private readonly viewerContext: ViewerContextService,
  ) {}

  async findAll(viewer: User | null): Promise<FriendDto[]> {
    const ctx = await this.viewerContext.for(viewer);
    const profiles = await this.db.profile.findMany({
      orderBy: { displayName: 'asc' },
      include: PROFILE_INCLUDE,
    });
    return profiles.map((profile) => toFriendDto(profile, ctx));
  }

  /// `idOrHandle` accepts either the profile's id or its @handle, so links can
  /// use whichever identifier the caller has.
  async findOne(idOrHandle: string, viewer: User | null): Promise<FriendDto> {
    const ctx = await this.viewerContext.for(viewer);
    const profile = await this.findOrThrow(idOrHandle);
    return toFriendDto(profile, ctx);
  }

  async create(dto: CreateFriendDto, viewer: User): Promise<FriendDto> {
    const ctx = await this.viewerContext.for(viewer);
    validateBirthdayInput(dto);

    const profile = await this.db.profile.create({
      data: {
        displayName: dto.name,
        socialMedias: dto.socialMedias ?? undefined,
        avatarKey: dto.avatarKey ?? null,
        avatarUrl: dto.avatarKey
          ? this.storage.getPublicUrl(dto.avatarKey)
          : null,
        addedById: viewer.id,
        birthday:
          dto.birthMonth !== undefined && dto.birthDay !== undefined
            ? {
                create: {
                  year: dto.birthYear ?? null,
                  month: dto.birthMonth,
                  day: dto.birthDay,
                  visibility: dto.visibility ?? FriendVisibility.PUBLIC,
                },
              }
            : undefined,
      },
      include: PROFILE_INCLUDE,
    });

    if (dto.birthMonth !== undefined && dto.birthDay !== undefined) {
      await this.cache.invalidate(CACHE_KEYS.birthdaysList());
    }

    return toFriendDto(await this.settleAvatar(profile), ctx);
  }

  async update(
    id: string,
    dto: UpdateFriendDto,
    viewer: User,
  ): Promise<FriendDto> {
    const ctx = await this.viewerContext.for(viewer);
    const existing = await this.findOrThrow(id);
    assertCanEdit(existing, viewer);
    validateBirthdayInput(dto);

    const isReplacingAvatar =
      dto.avatarKey !== undefined && dto.avatarKey !== existing.avatarKey;

    const profile = await this.db.$transaction(async (tx) => {
      if (isReplacingAvatar && existing.avatarKey && existing.avatarUrl) {
        await this.avatars.archiveCurrent(
          tx,
          id,
          existing.avatarKey,
          existing.avatarUrl,
        );
      }

      return tx.profile.update({
        where: { id },
        data: {
          displayName: dto.name,
          socialMedias: dto.socialMedias,
          avatarKey: dto.avatarKey,
          avatarUrl: dto.avatarKey
            ? this.storage.getPublicUrl(dto.avatarKey)
            : undefined,
          birthday: birthdayWriteFor(dto, existing.birthday !== null),
        },
        include: PROFILE_INCLUDE,
      });
    });

    return toFriendDto(await this.settleAvatar(profile), ctx);
  }

  /// Moves a newly staged avatar into the profile's own folder, now that the
  /// profile id is known. Deliberately runs *after* the row is written: if the
  /// move fails, the row still points at the valid staged object rather than
  /// at a key that was never created.
  private async settleAvatar(
    profile: ProfileWithBirthday,
  ): Promise<ProfileWithBirthday> {
    if (!profile.avatarKey || !isStagedKey(profile.avatarKey)) return profile;

    const key = avatarKeyFor(profile.id, profile.avatarKey);
    await this.storage.moveObject(profile.avatarKey, key);

    return this.db.profile.update({
      where: { id: profile.id },
      data: { avatarKey: key, avatarUrl: this.storage.getPublicUrl(key) },
      include: PROFILE_INCLUDE,
    });
  }

  /// Only an unclaimed profile can be deleted. A claimed one is somebody's
  /// identity — and since only its owner can reach this at all, that means you
  /// cannot delete yourself out of the directory either.
  async remove(id: string, viewer: User): Promise<void> {
    const existing = await this.findOrThrow(id);
    assertCanEdit(existing, viewer);

    if (existing.userId) {
      throw new ForbiddenException('You cannot delete a claimed profile');
    }

    await this.db.profile.delete({ where: { id } });
  }

  /// Paginated, debounced-search-friendly listing used by the onboarding
  /// connections picker. Matches name and handle; social handles live in an
  /// unstructured JSON column that isn't practical to ILIKE across portably.
  async search(
    query: string | undefined,
    page: number,
    pageSize: number,
    viewer: User | null,
  ): Promise<PaginatedFriendsDto> {
    const ctx = await this.viewerContext.for(viewer);
    // The null branch is required: `not` alone drops every unclaimed profile,
    // since SQL compares NULL to the viewer's id as unknown rather than true.
    const where: Prisma.ProfileWhereInput = {
      AND: [
        nameSearchWhere(query),
        ...(viewer
          ? [{ OR: [{ userId: null }, { userId: { not: viewer.id } }] }]
          : []),
      ],
    };

    const [profiles, total] = await Promise.all([
      this.db.profile.findMany({
        where,
        orderBy: { displayName: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: PROFILE_INCLUDE,
      }),
      this.db.profile.count({ where }),
    ]);

    return {
      items: profiles.map((profile) => toFriendDto(profile, ctx)),
      total,
      page,
      pageSize,
    };
  }

  async listAvatarVersions(id: string): Promise<AvatarVersionsDto> {
    await this.findOrThrow(id);
    const versions = await this.avatars.listVersions(id);
    return { versions };
  }

  async restoreAvatarVersion(
    id: string,
    versionId: string,
    viewer: User,
  ): Promise<FriendDto> {
    const ctx = await this.viewerContext.for(viewer);
    const existing = await this.findOrThrow(id);
    assertCanEdit(existing, viewer);

    const profile = await this.db.$transaction(async (tx) => {
      if (existing.avatarKey && existing.avatarUrl) {
        await this.avatars.archiveCurrent(
          tx,
          id,
          existing.avatarKey,
          existing.avatarUrl,
        );
      }
      const restored = await this.avatars.takeVersion(tx, id, versionId);
      return tx.profile.update({
        where: { id },
        data: { avatarKey: restored.key, avatarUrl: restored.url },
        include: PROFILE_INCLUDE,
      });
    });

    return toFriendDto(profile, ctx);
  }

  /// Profile-shaped wrapper over the account-level connection graph, because
  /// the profile page only knows the profile it is showing.
  async connect(id: string, viewer: User): Promise<FriendDto> {
    const profile = await this.findOrThrow(id);
    if (profile.userId === viewer.id) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }
    if (!profile.userId) {
      throw new BadRequestException(
        'Nobody has claimed this entry, so there is no account to connect with',
      );
    }

    await this.connections.request(profile.userId, viewer);
    return this.findOne(id, viewer);
  }

  async disconnect(id: string, viewer: User): Promise<FriendDto> {
    const ctx = await this.viewerContext.for(viewer);
    const profile = await this.findOrThrow(id);
    const ownerId = profile.userId;
    if (!ownerId || ownerId === viewer.id) {
      throw new BadRequestException('There is no connection to remove');
    }

    if (ctx.connections.connectedUserIds.has(ownerId)) {
      await this.connections.disconnect(ownerId, viewer);
    } else {
      await this.connections.withdrawWith(ownerId, viewer);
    }

    return this.findOne(id, viewer);
  }

  /// Links an unclaimed profile to the calling account. Permanent.
  async claim(id: string, viewer: User): Promise<FriendDto> {
    const profile = await this.findOrThrow(id);
    if (profile.userId) {
      throw new ForbiddenException('This entry has already been claimed');
    }

    const alreadyClaimed = await this.db.profile.findUnique({
      where: { userId: viewer.id },
      select: { id: true },
    });
    if (alreadyClaimed) {
      throw new ForbiddenException(
        'Your account is already associated with an entry',
      );
    }

    await this.db.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id },
        data: { userId: viewer.id },
      });
      // Whoever added this profile already knows you, so asking them to
      // confirm a request would be theatre.
      if (profile.addedById) {
        await this.connections.linkAccepted(tx, viewer.id, profile.addedById);
      }
    });

    if (profile.addedById) {
      await this.connections.invalidateFor(viewer.id, profile.addedById);
    }

    return this.findOne(id, viewer);
  }

  private async findOrThrow(idOrHandle: string): Promise<ProfileWithBirthday> {
    const profile = await this.db.profile.findFirst({
      where: {
        OR: [{ id: idOrHandle }, { handle: idOrHandle.toLowerCase() }],
      },
      include: PROFILE_INCLUDE,
    });
    if (!profile) {
      throw new NotFoundException(`Friend ${idOrHandle} not found`);
    }
    return profile;
  }
}

function assertCanEdit(profile: ProfileWithBirthday, viewer: User): void {
  if (!canEditProfile(profile, viewer)) {
    throw new ForbiddenException(
      'You can only edit your own profile, or an unclaimed one you added',
    );
  }
}
