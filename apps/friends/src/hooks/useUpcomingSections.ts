import { useEffect, useRef, useState } from 'react';
import {
  useUpcomingFriendSections,
  type UpcomingFriendSectionsQueryResult,
} from '@hatohui/models';
import type { UpcomingFriendDto } from '@hatohui/models';
import { formatMonth } from '@hatohui/tools';
import {
  UPCOMING_SECTIONS_PAGE_SIZE,
  type GroupOption,
  type SortDirection,
} from '../constants/directoryView';

export type FriendGroup = {
  key: string;
  label: string;
  friends: UpcomingFriendDto[];
};

function sectionLabel(key: string, group: GroupOption, locale: string): string {
  switch (group) {
    case 'month':
      return formatMonth(`${key}-01`, locale);
    case 'age':
    case 'year':
      return key;
    case 'none':
      return '';
  }
}

function mergeSections(
  prev: FriendGroup[],
  incoming: FriendGroup[],
  isFirstPage: boolean,
): FriendGroup[] {
  if (isFirstPage) return incoming;
  if (incoming.length === 0) return prev;

  const incomingKeys = new Set(incoming.map((s) => s.key));
  const prevMap = new Map(prev.map((s) => [s.key, s]));

  // Find where the overlap begins: the first prev section whose key
  // also appears in incoming. Everything before it is clean.
  const overlapStart = prev.findIndex((s) => incomingKeys.has(s.key));
  const base = overlapStart >= 0 ? prev.slice(0, overlapStart) : prev;

  // Merge each incoming section, deduplicating friends against whatever
  // already exists in prev for that section key.
  const merged = incoming.map((section) => {
    const existing = prevMap.get(section.key);
    if (!existing) return section;
    const existingIds = new Set(existing.friends.map((f) => f.id));
    const newFriends = section.friends.filter((f) => !existingIds.has(f.id));
    return { ...existing, friends: [...existing.friends, ...newFriends] };
  });

  return [...base, ...merged];
}

export function useUpcomingSections(
  search: string,
  group: GroupOption,
  direction: SortDirection,
  locale: string,
) {
  const [page, setPage] = useState(1);
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [prevFilters, setPrevFilters] = useState({ search, group, direction });

  const filtersChanged =
    prevFilters.search !== search ||
    prevFilters.group !== group ||
    prevFilters.direction !== direction;
  if (filtersChanged) {
    setPrevFilters({ search, group, direction });
    setPage(1);
    setGroups([]);
  }

  const effectivePage = filtersChanged ? 1 : page;

  const query = useUpcomingFriendSections({
    query: search || undefined,
    group,
    direction,
    page: effectivePage,
    pageSize: UPCOMING_SECTIONS_PAGE_SIZE,
  });

  const [seenData, setSeenData] = useState<
    UpcomingFriendSectionsQueryResult | undefined
  >(undefined);
  const fetchingRef = useRef(false);

  if (filtersChanged) {
    setSeenData(undefined);
  }
  if (query.data && query.data !== seenData) {
    setSeenData(query.data);
    const incoming = query.data.data.sections.map((section) => ({
      key: section.key,
      label: sectionLabel(section.key, group, locale),
      friends: section.friends,
    }));
    setGroups((prev) => mergeSections(prev, incoming, effectivePage === 1));
  }

  useEffect(() => {
    fetchingRef.current = false;
  }, [query.data, search, group, direction]);

  return {
    groups,
    isLoading: query.isLoading && effectivePage === 1,
    isError: query.isError,
    isFetchingMore: query.isFetching && page > 1,
    hasMore: query.data?.data.hasMore ?? false,
    loadMore: () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setPage((p) => p + 1);
    },
    refetch: query.refetch,
  };
}
