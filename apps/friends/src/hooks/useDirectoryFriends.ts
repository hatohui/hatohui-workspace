import { useMemo } from 'react';
import type { UpcomingFriendDto } from '@hatohui/models';
import { formatMonth } from '@hatohui/tools';
import type { GroupOption, SortDirection } from '../constants/directoryView';

export type FriendGroup = {
  key: string;
  label: string;
  friends: UpcomingFriendDto[];
  sortValue: number;
};

const UNKNOWN_SORT_VALUE = Number.MAX_SAFE_INTEGER;

function matchesSearch(friend: UpcomingFriendDto, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  if (friend.name.toLowerCase().includes(needle)) return true;
  if (friend.nextBirthdayDate.includes(needle)) return true;
  const handles = Object.values(
    (friend.socialMedias as Record<string, string> | null) ?? {},
  );
  return handles.some((handle) => handle.toLowerCase().includes(needle));
}

function groupKey(friend: UpcomingFriendDto, group: GroupOption): string {
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

/// Determines each group's position in the list — always ascending by the
/// group's own natural order (chronological for month, numeric for age/year),
/// never by insertion order, regardless of how the underlying friends are
/// currently arranged.
function groupSortValue(key: string, group: GroupOption): number {
  if (key === 'unknown' || key === 'all') return UNKNOWN_SORT_VALUE;
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

function groupLabel(
  key: string,
  group: GroupOption,
  friend: UpcomingFriendDto,
  locale: string,
): string {
  switch (group) {
    case 'month':
      return formatMonth(friend.nextBirthdayDate, locale);
    case 'age':
    case 'year':
      return key;
    case 'none':
      return '';
  }
}

export function useDirectoryFriends(
  friends: UpcomingFriendDto[],
  search: string,
  group: GroupOption,
  direction: SortDirection,
  locale: string,
): FriendGroup[] {
  return useMemo(() => {
    const filtered = friends.filter((friend) => matchesSearch(friend, search));

    const groups: FriendGroup[] = [];
    for (const friend of filtered) {
      const key = groupKey(friend, group);
      const existing = groups.find((g) => g.key === key);
      if (existing) {
        existing.friends.push(friend);
      } else {
        groups.push({
          key,
          label: groupLabel(key, group, friend, locale),
          friends: [friend],
          sortValue: groupSortValue(key, group),
        });
      }
    }

    groups.sort((a, b) => a.sortValue - b.sortValue);
    return direction === 'desc' ? groups.reverse() : groups;
  }, [friends, search, group, direction, locale]);
}
