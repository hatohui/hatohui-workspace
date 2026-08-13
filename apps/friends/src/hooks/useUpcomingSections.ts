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

  // Reset to page 1 whenever filters change — tracked via ref to avoid
  // triggering the query before the state settles.
  const prevFiltersRef = useRef({ search, group, direction });
  const filtersChanged =
    prevFiltersRef.current.search !== search ||
    prevFiltersRef.current.group !== group ||
    prevFiltersRef.current.direction !== direction;

  if (filtersChanged) {
    prevFiltersRef.current = { search, group, direction };
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

  // Accumulate pages into `groups` without touching render-phase state.
  // Using a ref to track which response we've already merged so we don't
  // double-apply on re-renders.
  const lastMergedRef = useRef<UpcomingFriendSectionsQueryResult | undefined>(
    undefined,
  );
  useEffect(() => {
    if (!query.data || query.data === lastMergedRef.current) return;
    lastMergedRef.current = query.data;
    const incoming = query.data.data.sections.map((section) => ({
      key: section.key,
      label: sectionLabel(section.key, group, locale),
      friends: section.friends,
    }));
    setGroups((prev) => mergeSections(prev, incoming, effectivePage === 1));
  }, [query.data, effectivePage, group, locale]);

  return {
    groups,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetchingMore: query.isFetching && page > 1,
    hasMore: query.data?.data.hasMore ?? false,
    loadMore: () => setPage((p) => p + 1),
    refetch: query.refetch,
  };
}
