import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '@/libs/db';
import { Storage } from '@/libs/storage';
import { AvatarsService } from '@/modules/avatars/avatars.service';
import { AvatarVersionsDto } from '@/modules/avatars/dto/avatar-version.dto';
import {
  CreateFriendDto,
  FriendDto,
  SocialGraphDto,
  UpcomingFriendDto,
  UpdateFriendDto,
} from './dto/friend.dto';
import { PaginatedFriendsDto } from './dto/friend-search.dto';
import {
  BirthdaysByMonthDto,
  PaginatedUpcomingSectionsDto,
  UpcomingSectionDto,
  type SortDirection,
  type UpcomingGroupOption,
} from './dto/friend-upcoming.dto';
import {
  ConnectionsService,
  EMPTY_CONNECTION_CONTEXT,
  type ConnectionContext,
} from '@/modules/connections/connections.service';
import type { ConnectionState } from '@/modules/connections/dto/connection.dto';
import {
  FriendVisibility,
  Prisma,
  type BirthdayDetails,
  type User,
} from '@prisma/client';

type BirthdayDetailsWithAssociation = BirthdayDetails & {
  association: { userId: string; user: { handle: string | null } } | null;
};

/// Everything a request needs to know about the viewer, resolved once up
/// front. Connections used to be joined onto every BirthdayDetails query just
/// to compute one boolean; now they're fetched once here and answered in
/// memory, which also lets FRIENDS_ONLY be a real relationship check.
interface ViewerContext {
  viewer: User | null;
  connections: ConnectionContext;
}

const ANONYMOUS_CONTEXT: ViewerContext = {
  viewer: null,
  connections: EMPTY_CONNECTION_CONTEXT,
};

/// The accounts whose FRIENDS_ONLY entries the viewer is allowed to see:
/// themselves plus everyone they're connected with.
function circleOf(ctx: ViewerContext): string[] {
  if (!ctx.viewer) return [];
  return [ctx.viewer.id, ...ctx.connections.connectedUserIds];
}

/// Internal-only shape used while computing/grouping/searching upcoming
/// birthdays — carries every field the search/grouping logic needs
/// (birthYear, socialMedias, ...). Narrowed down to the slim public
/// `UpcomingFriendDto` only once a page of results is finalized.
type UpcomingComputedFriend = FriendDto & {
  turningAge: number | null;
  nextBirthdayDate: string;
};

const SOCIAL_GRAPH_FRIEND_LIMIT = 10;
const SOCIAL_GRAPH_FRIEND_OF_FRIEND_LIMIT = 2;

/// Shared `include` for every BirthdayDetails query — just the association,
/// which supplies the entry's handle, owner and "is this me" answer. No longer
/// viewer-dependent: connection state comes from the ViewerContext instead of
/// a per-entry join.
const ENTRY_INCLUDE = {
  association: {
    select: { userId: true, user: { select: { handle: true } } },
  },
} as const;

/// An entry's "owner" for privacy purposes: the account it represents if it's
/// been claimed, otherwise whoever added it. FRIENDS_ONLY is evaluated against
/// this account's circle.
function ownerIdOf(entry: BirthdayDetailsWithAssociation): string | null {
  return entry.association?.userId ?? entry.addedById;
}

function visibilityWhere(ctx: ViewerContext): Prisma.BirthdayDetailsWhereInput {
  const { viewer } = ctx;
  if (!viewer) {
    return { visibility: FriendVisibility.PUBLIC };
  }

  const circle = circleOf(ctx);
  return {
    OR: [
      { visibility: FriendVisibility.PUBLIC },
      // FRIENDS_ONLY means exactly that now: the owner's accepted connections,
      // the owner themselves, and whoever added the entry.
      {
        visibility: FriendVisibility.FRIENDS_ONLY,
        OR: [
          { addedById: { in: circle } },
          { association: { userId: { in: circle } } },
        ],
      },
      { visibility: FriendVisibility.NONE, addedById: viewer.id },
      {
        visibility: FriendVisibility.NONE,
        association: { userId: viewer.id },
      },
    ],
  };
}

function nameSearchWhere(
  query: string | undefined,
): Prisma.BirthdayDetailsWhereInput {
  const needle = query?.trim();
  return needle
    ? { name: { contains: needle, mode: 'insensitive' as const } }
    : {};
}

@Injectable()
export class FriendsService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly avatars: AvatarsService,
    private readonly connections: ConnectionsService,
  ) {}

  /// Resolves the viewer's connection graph once per request. Every public
  /// method starts here and threads the result down, so no query below needs
  /// to know how connections are stored.
  private async context(viewer: User | null): Promise<ViewerContext> {
    if (!viewer) return ANONYMOUS_CONTEXT;
    return {
      viewer,
      connections: await this.connections.getContext(viewer.id),
    };
  }

  async findAll(viewer: User | null): Promise<FriendDto[]> {
    const ctx = await this.context(viewer);
    const entries = await this.db.birthdayDetails.findMany({
      where: visibilityWhere(ctx),
      orderBy: { name: 'asc' },
      include: ENTRY_INCLUDE,
    });
    return entries.map((entry) => toFriendDto(entry, ctx));
  }

  async findUpcomingSections(
    query: string | undefined,
    group: UpcomingGroupOption,
    direction: SortDirection,
    page: number,
    pageSize: number,
    viewer: User | null,
  ): Promise<PaginatedUpcomingSectionsDto> {
    const ctx = await this.context(viewer);
    const computed = await this.computeUpcoming(ctx);
    const matching = computed
      .map((entry) => entry.upcoming)
      .filter((friend) => matchesUpcomingSearch(friend, query));

    const orderedSections = groupUpcomingFriends(matching, group, direction);
    const flattened = orderedSections.flatMap((section) =>
      section.friends.map((friend) => ({ key: section.key, friend })),
    );

    const start = (page - 1) * pageSize;
    const pageItems = flattened.slice(start, start + pageSize);

    const sections: UpcomingSectionDto[] = [];
    for (const item of pageItems) {
      const friend = toUpcomingFriendDto(item.friend);
      const existing = sections.at(-1);
      if (existing && existing.key === item.key) {
        existing.friends.push(friend);
      } else {
        sections.push({ key: item.key, friends: [friend] });
      }
    }

    return {
      sections,
      page,
      pageSize,
      hasMore: start + pageItems.length < flattened.length,
    };
  }

  async findBirthdaysByMonth(
    month: number,
    query: string | undefined,
    viewer: User | null,
  ): Promise<BirthdaysByMonthDto> {
    const ctx = await this.context(viewer);
    const entries = await this.db.birthdayDetails.findMany({
      where: {
        birthMonth: month,
        birthDay: { not: null },
        AND: visibilityWhere(ctx),
      },
      orderBy: { birthDay: 'asc' },
      include: ENTRY_INCLUDE,
    });

    return {
      friends: entries
        .map((entry) => toFriendDto(entry, ctx))
        .filter((friend) => matchesFriendSearch(friend, query)),
    };
  }

  private async computeUpcoming(
    ctx: ViewerContext,
  ): Promise<{ upcoming: UpcomingComputedFriend; sortKey: number }[]> {
    const entries = await this.db.birthdayDetails.findMany({
      where: {
        birthMonth: { not: null },
        birthDay: { not: null },
        AND: visibilityWhere(ctx),
      },
      include: ENTRY_INCLUDE,
    });

    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    return entries
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
            ...toFriendDto(entry, ctx),
            turningAge,
            nextBirthdayDate: nextBirthdayDate.toISOString().slice(0, 10),
          },
          sortKey: nextBirthdayDate.getTime(),
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey);
  }

  /// `idOrHandle` accepts either the entry's own id or the global @handle of
  /// the account it's associated with, so profile links can use whichever
  /// identifier the caller has (associated entries are linked to a User).
  async findOne(idOrHandle: string, viewer: User | null): Promise<FriendDto> {
    const ctx = await this.context(viewer);
    const id = await this.resolveEntryId(idOrHandle);
    const entry = await this.findVisibleOrThrow(id, ctx);
    return toFriendDto(entry, ctx);
  }

  private async resolveEntryId(idOrHandle: string): Promise<string> {
    const byId = await this.db.birthdayDetails.findUnique({
      where: { id: idOrHandle },
      select: { id: true },
    });
    if (byId) return byId.id;

    const byHandle = await this.db.user.findUnique({
      where: { handle: idOrHandle.toLowerCase() },
      select: { association: { select: { birthdayDetailsId: true } } },
    });
    return byHandle?.association?.birthdayDetailsId ?? idOrHandle;
  }

  async create(dto: CreateFriendDto, viewer: User): Promise<FriendDto> {
    const ctx = await this.context(viewer);
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
      include: ENTRY_INCLUDE,
    });
    return toFriendDto(entry, ctx);
  }

  async update(
    id: string,
    dto: UpdateFriendDto,
    viewer: User,
  ): Promise<FriendDto> {
    const ctx = await this.context(viewer);
    const existing = await this.findVisibleOrThrow(id, ctx);
    assertCanEdit(existing, viewer);
    validateBirthday(dto);

    const isReplacingAvatar =
      dto.avatarKey !== undefined && dto.avatarKey !== existing.avatarKey;

    const entry = await this.db.$transaction(async (tx) => {
      if (isReplacingAvatar && existing.avatarKey && existing.avatarUrl) {
        await this.avatars.archiveCurrent(
          tx,
          id,
          existing.avatarKey,
          existing.avatarUrl,
        );
      }

      return tx.birthdayDetails.update({
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
        include: ENTRY_INCLUDE,
      });
    });

    return toFriendDto(entry, ctx);
  }

  async listAvatarVersions(
    id: string,
    viewer: User | null,
  ): Promise<AvatarVersionsDto> {
    const ctx = await this.context(viewer);
    await this.findVisibleOrThrow(id, ctx);
    const versions = await this.avatars.listVersions(id);
    return { versions };
  }

  async restoreAvatarVersion(
    id: string,
    versionId: string,
    viewer: User,
  ): Promise<FriendDto> {
    const ctx = await this.context(viewer);
    const existing = await this.findVisibleOrThrow(id, ctx);
    assertCanEdit(existing, viewer);

    const entry = await this.db.$transaction(async (tx) => {
      if (existing.avatarKey && existing.avatarUrl) {
        await this.avatars.archiveCurrent(
          tx,
          id,
          existing.avatarKey,
          existing.avatarUrl,
        );
      }
      const restored = await this.avatars.takeVersion(tx, id, versionId);
      return tx.birthdayDetails.update({
        where: { id },
        data: { avatarKey: restored.key, avatarUrl: restored.url },
        include: ENTRY_INCLUDE,
      });
    });

    return toFriendDto(entry, ctx);
  }

  /// If the entry is associated with an account, the association is
  /// permanent — "deleting" only clears the profile fields, so the slot can
  /// never be re-claimed. Only unassociated entries are actually removed.
  async remove(id: string, viewer: User): Promise<void> {
    const ctx = await this.context(viewer);
    const existing = await this.findVisibleOrThrow(id, ctx);
    assertCanEdit(existing, viewer);

    if (existing.association?.userId === viewer.id) {
      throw new ForbiddenException('You cannot delete your own entry');
    }

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
    const ctx = await this.context(viewer);
    const where: Prisma.BirthdayDetailsWhereInput = {
      ...nameSearchWhere(query),
      AND: visibilityWhere(ctx),
      ...(viewer ? { NOT: { association: { userId: viewer.id } } } : {}),
    };

    const [entries, total] = await Promise.all([
      this.db.birthdayDetails.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: ENTRY_INCLUDE,
      }),
      this.db.birthdayDetails.count({ where }),
    ]);

    const items = entries.map((entry) => toFriendDto(entry, ctx));
    return { items, total, page, pageSize };
  }

  /// Sends a connection request to the account behind this entry. Kept as an
  /// entry-shaped wrapper because the profile page only knows the entry it is
  /// showing; the connection itself is between accounts.
  async connect(id: string, viewer: User): Promise<FriendDto> {
    const ctx = await this.context(viewer);
    const entry = await this.findVisibleOrThrow(id, ctx);
    if (entry.association?.userId === viewer.id) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }
    if (!entry.association) {
      throw new BadRequestException(
        'Nobody has claimed this entry, so there is no account to connect with',
      );
    }

    await this.connections.request(entry.association.userId, viewer);
    return this.findOne(id, viewer);
  }

  /// Undoes `connect` from the same entry-shaped angle: withdraws a pending
  /// request or removes an accepted connection, whichever exists.
  async disconnect(id: string, viewer: User): Promise<FriendDto> {
    const ctx = await this.context(viewer);
    const entry = await this.findVisibleOrThrow(id, ctx);
    const ownerId = entry.association?.userId;
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

  /// Links an unassociated entry to the calling account. Permanent — an
  /// already-associated entry can never be reclaimed, even if its details
  /// are later cleared (see `remove`).
  async claim(id: string, viewer: User): Promise<FriendDto> {
    const ctx = await this.context(viewer);
    const entry = await this.findVisibleOrThrow(id, ctx);
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

    await this.db.$transaction(async (tx) => {
      await tx.association.create({
        data: { userId: viewer.id, birthdayDetailsId: id },
      });
      // Whoever added this entry already knows you — asking them to confirm a
      // request would be theatre, so the connection is accepted outright.
      if (entry.addedById) {
        await this.connections.linkAccepted(tx, viewer.id, entry.addedById);
      }
    });

    if (entry.addedById) {
      await this.connections.invalidateFor(viewer.id, entry.addedById);
    }

    return this.findOne(id, viewer);
  }

  /// Renders as: you -- someone in your circle -- someone in theirs. A
  /// "circle" is the entries you added plus the entries of accounts you're
  /// connected with, so it spans both people who have accounts and people who
  /// only exist as a birthday someone wrote down.
  async getSocialGraph(viewer: User): Promise<SocialGraphDto> {
    const ctx = await this.context(viewer);
    const own = await this.circleEntries(viewer.id, ctx);
    const firstRing = own.slice(0, SOCIAL_GRAPH_FRIEND_LIMIT);
    const seen = new Set(firstRing.map((entry) => entry.id));

    const friends = await Promise.all(
      firstRing.map(async (entry) => {
        const ownerId = entry.association?.userId;
        // Only a claimed entry has an account whose own circle we can walk.
        const friendsOfFriend =
          ownerId && ownerId !== viewer.id
            ? (await this.circleEntries(ownerId, ctx))
                .filter((other) => !seen.has(other.id))
                .slice(0, SOCIAL_GRAPH_FRIEND_OF_FRIEND_LIMIT)
            : [];
        // Claim ids as we go so the same person can't appear twice in the
        // tree — duplicates would collide as React keys in the layout hook.
        for (const other of friendsOfFriend) seen.add(other.id);

        return {
          friend: toFriendDto(entry, ctx),
          friendsOfFriend: friendsOfFriend.map((other) =>
            toFriendDto(other, ctx),
          ),
        };
      }),
    );

    return { friends };
  }

  /// Everyone in one account's circle: entries they added, plus the entries
  /// of accounts they're connected with. Visibility is filtered before any
  /// capping so the caller never silently gets a short ring.
  private async circleEntries(
    userId: string,
    ctx: ViewerContext,
  ): Promise<BirthdayDetailsWithAssociation[]> {
    const connections = await this.connections.getContext(userId);
    const connectedIds = [...connections.connectedUserIds];

    const entries = await this.db.birthdayDetails.findMany({
      where: {
        OR: [
          { addedById: userId },
          ...(connectedIds.length > 0
            ? [{ association: { userId: { in: connectedIds } } }]
            : []),
        ],
        NOT: { association: { userId } },
      },
      orderBy: { name: 'asc' },
      include: ENTRY_INCLUDE,
    });

    return entries.filter((entry) => canView(entry, ctx));
  }

  private async findVisibleOrThrow(
    id: string,
    ctx: ViewerContext,
  ): Promise<BirthdayDetailsWithAssociation> {
    const entry = await this.db.birthdayDetails.findUnique({
      where: { id },
      include: ENTRY_INCLUDE,
    });
    if (!entry || !canView(entry, ctx)) {
      throw new NotFoundException(`Friend ${id} not found`);
    }
    return entry;
  }
}

/// In-memory mirror of `visibilityWhere` — keep the two in step.
function canView(
  entry: BirthdayDetailsWithAssociation,
  ctx: ViewerContext,
): boolean {
  const { viewer } = ctx;
  switch (entry.visibility) {
    case FriendVisibility.PUBLIC:
      return true;
    case FriendVisibility.FRIENDS_ONLY: {
      if (!viewer) return false;
      const circle = circleOf(ctx);
      const owner = ownerIdOf(entry);
      return (
        (entry.addedById !== null && circle.includes(entry.addedById)) ||
        (owner !== null && circle.includes(owner))
      );
    }
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
  ctx: ViewerContext,
): FriendDto {
  const { viewer } = ctx;
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
    handle: entry.association?.user.handle ?? null,
    isAssociated: entry.association !== null,
    isViewerEntry: viewer !== null && entry.association?.userId === viewer.id,
    connectionStatus: connectionStatusOf(entry, ctx),
    canEdit: viewer !== null && entry.addedById === viewer.id,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

/// Connections are between accounts, so an entry nobody has claimed has no
/// connection state at all — there is no one on the other side to ask.
function connectionStatusOf(
  entry: BirthdayDetailsWithAssociation,
  ctx: ViewerContext,
): ConnectionState {
  const { viewer } = ctx;
  const ownerId = entry.association?.userId;
  if (!viewer || !ownerId || ownerId === viewer.id) return 'NONE';

  if (ctx.connections.connectedUserIds.has(ownerId)) return 'ACCEPTED';
  if (ctx.connections.pendingOutgoingUserIds.has(ownerId)) {
    return 'PENDING_OUTGOING';
  }
  if (ctx.connections.pendingIncomingUserIds.has(ownerId)) {
    return 'PENDING_INCOMING';
  }
  return 'NONE';
}

function matchesFriendSearch(
  friend: FriendDto,
  query: string | undefined,
): boolean {
  const needle = query?.trim().toLowerCase();
  if (!needle) return true;
  if (friend.name.toLowerCase().includes(needle)) return true;
  const handles = Object.values(friend.socialMedias ?? {});
  return handles.some((handle) => handle.toLowerCase().includes(needle));
}

function toUpcomingFriendDto(
  friend: UpcomingComputedFriend,
): UpcomingFriendDto {
  return {
    id: friend.id,
    name: friend.name,
    handle: friend.handle,
    avatarUrl: friend.avatarUrl,
    isViewerEntry: friend.isViewerEntry,
    turningAge: friend.turningAge,
    nextBirthdayDate: friend.nextBirthdayDate,
  };
}

function matchesUpcomingSearch(
  friend: UpcomingComputedFriend,
  query: string | undefined,
): boolean {
  const needle = query?.trim().toLowerCase();
  if (!needle) return true;
  return (
    matchesFriendSearch(friend, query) ||
    friend.nextBirthdayDate.includes(needle)
  );
}

const UNKNOWN_GROUP_SORT_VALUE = Number.MAX_SAFE_INTEGER;

function upcomingGroupKey(
  friend: UpcomingComputedFriend,
  group: UpcomingGroupOption,
): string {
  switch (group) {
    case 'month':
      return friend.nextBirthdayDate.slice(0, 7);
    case 'age':
      return friend.turningAge !== null ? String(friend.turningAge) : 'unknown';
    case 'year':
      return friend.birthYear !== null ? String(friend.birthYear) : 'unknown';
    case 'none':
      return 'all';
  }
}

function upcomingGroupSortValue(
  key: string,
  group: UpcomingGroupOption,
): number {
  if (key === 'unknown' || key === 'all') return UNKNOWN_GROUP_SORT_VALUE;
  switch (group) {
    case 'month':
      return new Date(`${key}-01`).getTime();
    case 'age':
    case 'year':
      return Number(key);
    case 'none':
      return 0;
  }
}

type UpcomingComputedSection = {
  key: string;
  friends: UpcomingComputedFriend[];
};

function groupUpcomingFriends(
  friends: UpcomingComputedFriend[],
  group: UpcomingGroupOption,
  direction: SortDirection,
): UpcomingComputedSection[] {
  const sections: (UpcomingComputedSection & { sortValue: number })[] = [];

  for (const friend of friends) {
    const key = upcomingGroupKey(friend, group);
    const existing = sections.find((section) => section.key === key);
    if (existing) {
      existing.friends.push(friend);
    } else {
      sections.push({
        key,
        friends: [friend],
        sortValue: upcomingGroupSortValue(key, group),
      });
    }
  }

  sections.sort((a, b) => a.sortValue - b.sortValue);
  if (direction === 'desc') sections.reverse();
  return sections;
}
