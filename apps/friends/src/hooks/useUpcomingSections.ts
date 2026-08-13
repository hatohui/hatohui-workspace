import { useRef, useState } from 'react';
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

  const [first, ...rest] = incoming;
  const last = prev.at(-1);
  if (last && first.key === last.key) {
    return [
      ...prev.slice(0, -1),
      { ...last, friends: [...last.friends, ...first.friends] },
      ...rest,
    ];
  }
  return [...prev, ...incoming];
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

  const seenDataRef = useRef<UpcomingFriendSectionsQueryResult | undefined>(
    undefined,
  );
  const fetchingRef = useRef(false);
  if (filtersChanged) {
    seenDataRef.current = undefined;
    fetchingRef.current = false;
  }
  if (query.data && query.data !== seenDataRef.current) {
    seenDataRef.current = query.data;
    fetchingRef.current = false;
    const incoming = query.data.data.sections.map((section) => ({
      key: section.key,
      label: sectionLabel(section.key, group, locale),
      friends: section.friends,
    }));
    setGroups((prev) => mergeSections(prev, incoming, effectivePage === 1));
  }

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
