import type { FriendDto, UpcomingFriendDto } from './dto/friend.dto';
import type {
  SortDirection,
  UpcomingGroupOption,
} from './dto/friend-upcoming.dto';

/// Carries every field the grouping/search logic needs; narrowed to the slim
/// public `UpcomingFriendDto` only once a page of results is finalized.
export type UpcomingComputedFriend = FriendDto & {
  turningAge: number | null;
  nextBirthdayDate: string;
};

export type UpcomingComputedSection = {
  key: string;
  friends: UpcomingComputedFriend[];
};

const UNKNOWN_GROUP_SORT_VALUE = Number.MAX_SAFE_INTEGER;

export function toUpcomingFriendDto(
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

export function matchesFriendSearch(
  friend: FriendDto,
  query: string | undefined,
): boolean {
  const needle = query?.trim().toLowerCase();
  if (!needle) return true;
  if (friend.name.toLowerCase().includes(needle)) return true;
  const handles = Object.values(friend.socialMedias ?? {});
  return handles.some((handle) => handle.toLowerCase().includes(needle));
}

export function matchesUpcomingSearch(
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

export function groupUpcomingFriends(
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
