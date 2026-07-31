import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '@/libs/db';
import { Storage } from '@/libs/storage';
import {
  CreateFriendDto,
  FriendDto,
  SocialGraphDto,
  UpcomingFriendDto,
  UpdateFriendDto,
} from './dto/friend.dto';
import { PaginatedFriendsDto } from './dto/friend-search.dto';
import {
  FriendVisibility,
  Role,
  type BirthdayDetails,
  type User,
} from '@prisma/client';

type BirthdayDetailsWithAssociation = BirthdayDetails & {
  association: { userId: string } | null;
};

const SOCIAL_GRAPH_FRIEND_LIMIT = 10;
const SOCIAL_GRAPH_FRIEND_OF_FRIEND_LIMIT = 2;

@Injectable()
export class FriendsService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
  ) {}

  async findAll(viewer: User | null): Promise<FriendDto[]> {
    const entries = await this.db.birthdayDetails.findMany({
      orderBy: { name: 'asc' },
      include: { association: { select: { userId: true } } },
    });
    return entries
      .filter((entry) => canView(entry, viewer))
      .map((entry) => toFriendDto(entry, viewer));
  }

  async findUpcoming(viewer: User | null): Promise<UpcomingFriendDto[]> {
    const entries = await this.db.birthdayDetails.findMany({
      where: { birthMonth: { not: null }, birthDay: { not: null } },
      include: { association: { select: { userId: true } } },
    });

    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    return entries
      .filter((entry) => canView(entry, viewer))
      .map((entry) => {
        const month = entry.birthMonth as number;
        const day = entry.birthDay as number;

        const isBeforeToday =
          month < todayMonth || (month === todayMonth && day < todayDay);
        const anchorYear = today.getFullYear() + (isBeforeToday ? 1 : 0);
        const nextBirthdayDate = new Date(Date.UTC(anchorYear, month - 1, day));

        const turningAge = entry.birthYear
          ? anchorYear - entry.birthYear
          : null;

        return {
          upcoming: {
            ...toFriendDto(entry, viewer),
            turningAge,
            nextBirthdayDate: nextBirthdayDate.toISOString().slice(0, 10),
          },
          sortKey: nextBirthdayDate.getTime(),
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((entry) => entry.upcoming);
  }

  async findOne(id: string, viewer: User | null): Promise<FriendDto> {
    const entry = await this.findVisibleOrThrow(id, viewer);
    return toFriendDto(entry, viewer);
  }

  async create(dto: CreateFriendDto, viewer: User): Promise<FriendDto> {
    validateBirthday(dto);
    const entry = await this.db.birthdayDetails.create({
      data: {
        name: dto.name,
        birthYear: dto.birthYear ?? null,
        birthMonth: dto.birthMonth ?? null,
        birthDay: dto.birthDay ?? null,
        socialMedias: dto.socialMedias ?? undefined,
        preferAnonymous: dto.preferAnonymous ?? true,
        visibility: dto.visibility ?? FriendVisibility.PUBLIC,
        avatarKey: dto.avatarKey ?? null,
        avatarUrl: dto.avatarKey
          ? this.storage.getPublicUrl(dto.avatarKey)
          : null,
        addedById: viewer.id,
      },
      include: { association: { select: { userId: true } } },
    });
    return toFriendDto(entry, viewer);
  }

  async update(
    id: string,
    dto: UpdateFriendDto,
    viewer: User,
  ): Promise<FriendDto> {
    const existing = await this.findVisibleOrThrow(id, viewer);
    assertCanEdit(existing, viewer);
    validateBirthday(dto);

    const isReplacingAvatar =
      dto.avatarKey !== undefined && dto.avatarKey !== existing.avatarKey;

    const entry = await this.db.birthdayDetails.update({
      where: { id },
      data: {
        name: dto.name,
        birthYear: dto.birthYear,
        birthMonth: dto.birthMonth,
        birthDay: dto.birthDay,
        socialMedias: dto.socialMedias,
        preferAnonymous: dto.preferAnonymous,
        visibility: dto.visibility,
        avatarKey: dto.avatarKey,
        avatarUrl: dto.avatarKey
          ? this.storage.getPublicUrl(dto.avatarKey)
          : undefined,
      },
      include: { association: { select: { userId: true } } },
    });

    if (isReplacingAvatar && existing.avatarKey) {
      await this.storage.deleteObject(existing.avatarKey).catch(() => {
        // best-effort cleanup; a stray object in storage isn't worth failing the update over
      });
    }

    return toFriendDto(entry, viewer);
  }

  /// If the entry is associated with an account, the association is
  /// permanent — "deleting" only clears the profile fields, so the slot can
  /// never be re-claimed. Only unassociated entries are actually removed.
  async remove(id: string, viewer: User): Promise<void> {
    const existing = await this.findVisibleOrThrow(id, viewer);
    assertCanEdit(existing, viewer);

    if (existing.association) {
      await this.db.birthdayDetails.update({
        where: { id },
        data: {
          birthYear: null,
          birthMonth: null,
          birthDay: null,
          socialMedias: undefined,
          avatarKey: null,
          avatarUrl: null,
        },
      });
      return;
    }

    await this.db.birthdayDetails.delete({ where: { id } });
  }

  /// Paginated, debounced-search-friendly listing used by the onboarding
  /// connections picker (and any other "find an existing entry" UI). Search
  /// is name-only for now — social handles live in an unstructured JSON
  /// column that isn't practical to ILIKE across portably.
  async search(
    query: string | undefined,
    page: number,
    pageSize: number,
    viewer: User | null,
  ): Promise<PaginatedFriendsDto> {
    const where = query
      ? { name: { contains: query, mode: 'insensitive' as const } }
      : {};

    const entries = await this.db.birthdayDetails.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { association: { select: { userId: true } } },
    });

    const visible = entries.filter((entry) => canView(entry, viewer));
    const start = (page - 1) * pageSize;
    const items = visible
      .slice(start, start + pageSize)
      .map((entry) => toFriendDto(entry, viewer));

    return { items, total: visible.length, page, pageSize };
  }

  /// Links an unassociated entry to the calling account. Permanent — an
  /// already-associated entry can never be reclaimed, even if its details
  /// are later cleared (see `remove`).
  async claim(id: string, viewer: User): Promise<FriendDto> {
    const entry = await this.findVisibleOrThrow(id, viewer);
    if (entry.association) {
      throw new ForbiddenException('This entry has already been claimed');
    }

    const existingAssociation = await this.db.association.findUnique({
      where: { userId: viewer.id },
    });
    if (existingAssociation) {
      throw new ForbiddenException(
        'Your account is already associated with an entry',
      );
    }

    await this.db.association.create({
      data: { userId: viewer.id, birthdayDetailsId: id },
    });

    return this.findOne(id, viewer);
  }

  /// Renders as: you -- friend -- friend's own friend. Friends-of-friends are
  /// only discoverable when a friend has claimed their entry (an
  /// Association), since unclaimed entries have no Connections of their own.
  async getSocialGraph(viewer: User): Promise<SocialGraphDto> {
    const connections = await this.db.connection.findMany({
      where: { userId: viewer.id },
      take: SOCIAL_GRAPH_FRIEND_LIMIT,
      include: {
        birthdayDetails: {
          include: { association: { select: { userId: true } } },
        },
      },
    });

    const friends = await Promise.all(
      connections
        .filter((connection) => canView(connection.birthdayDetails, viewer))
        .map(async (connection) => {
          const entry = connection.birthdayDetails;
          const friendsOfFriend = entry.association
            ? await this.findConnectedEntries(
                entry.association.userId,
                entry.id,
                viewer,
              )
            : [];
          return { friend: toFriendDto(entry, viewer), friendsOfFriend };
        }),
    );

    return { friends };
  }

  private async findConnectedEntries(
    userId: string,
    excludeBirthdayDetailsId: string,
    viewer: User,
  ): Promise<FriendDto[]> {
    const connections = await this.db.connection.findMany({
      where: { userId, NOT: { birthdayDetailsId: excludeBirthdayDetailsId } },
      take: SOCIAL_GRAPH_FRIEND_OF_FRIEND_LIMIT,
      include: {
        birthdayDetails: {
          include: { association: { select: { userId: true } } },
        },
      },
    });

    return connections
      .filter((connection) => canView(connection.birthdayDetails, viewer))
      .map((connection) => toFriendDto(connection.birthdayDetails, viewer));
  }

  private async findVisibleOrThrow(
    id: string,
    viewer: User | null,
  ): Promise<BirthdayDetailsWithAssociation> {
    const entry = await this.db.birthdayDetails.findUnique({
      where: { id },
      include: { association: { select: { userId: true } } },
    });
    if (!entry || !canView(entry, viewer)) {
      throw new NotFoundException(`Friend ${id} not found`);
    }
    return entry;
  }
}

function canView(
  entry: BirthdayDetailsWithAssociation,
  viewer: User | null,
): boolean {
  if (viewer?.role === Role.ADMIN) {
    return true;
  }
  switch (entry.visibility) {
    case FriendVisibility.PUBLIC:
      return true;
    case FriendVisibility.FRIENDS_ONLY:
      return viewer !== null;
    case FriendVisibility.NONE:
      return (
        viewer !== null &&
        (entry.addedById === viewer.id ||
          entry.association?.userId === viewer.id)
      );
  }
}

function assertCanEdit(
  entry: BirthdayDetailsWithAssociation,
  viewer: User,
): void {
  if (viewer.role === Role.ADMIN) {
    return;
  }
  if (entry.addedById !== viewer.id) {
    throw new ForbiddenException('You can only edit entries you added');
  }
}

function validateBirthday(dto: CreateFriendDto | UpdateFriendDto): void {
  const { birthYear, birthMonth, birthDay } = dto;

  if (
    birthYear !== undefined &&
    birthMonth === undefined &&
    birthDay === undefined
  ) {
    throw new BadRequestException(
      'birthYear cannot be set without birthMonth and birthDay',
    );
  }

  const hasMonth = birthMonth !== undefined;
  const hasDay = birthDay !== undefined;
  if (hasMonth !== hasDay) {
    throw new BadRequestException(
      'birthMonth and birthDay must both be provided together',
    );
  }

  if (hasMonth && hasDay) {
    // 2000 is a leap year, so Feb 29 round-trips correctly for month/day-only entries.
    const probe = new Date(2000, birthMonth - 1, birthDay);
    if (probe.getMonth() !== birthMonth - 1 || probe.getDate() !== birthDay) {
      throw new BadRequestException('birthMonth/birthDay is not a valid date');
    }
  }
}

function toFriendDto(
  entry: BirthdayDetailsWithAssociation,
  viewer: User | null,
): FriendDto {
  return {
    id: entry.id,
    name: entry.name,
    birthYear: entry.birthYear,
    birthMonth: entry.birthMonth,
    birthDay: entry.birthDay,
    socialMedias: (entry.socialMedias as Record<string, string> | null) ?? null,
    preferAnonymous: entry.preferAnonymous,
    visibility: entry.visibility,
    avatarUrl: entry.avatarUrl,
    addedById: entry.addedById,
    isAssociated: entry.association !== null,
    canEdit: viewer !== null && canEditEntry(entry, viewer),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function canEditEntry(
  entry: BirthdayDetailsWithAssociation,
  viewer: User,
): boolean {
  return viewer.role === Role.ADMIN || entry.addedById === viewer.id;
}
