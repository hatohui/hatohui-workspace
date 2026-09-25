'use client';

import { useState } from 'react';
import { useCommissions, type CommissionsDirection } from '@hatohui/models';
import { useDebouncedValue } from '@hatohui/libs';
import {
  COMMISSION_PAGE_SIZE,
  type CommissionListView,
} from '@/constants/commission';

export function useCommissionsList(view: CommissionListView) {
  const [query, setQuery] = useState('');
  const [direction, setDirection] = useState<CommissionsDirection>('desc');
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebouncedValue(query, 300);

  const commissionsQuery = useCommissions({
    view,
    query: debouncedQuery || undefined,
    sort: 'createdAt',
    direction,
    page,
    pageSize: COMMISSION_PAGE_SIZE,
  });

  return {
    items: commissionsQuery.data?.data.items ?? [],
    total: commissionsQuery.data?.data.total ?? 0,
    hasMore: commissionsQuery.data?.data.hasMore ?? false,
    isLoading: commissionsQuery.isPending,
    query,
    setQuery: (value: string) => {
      setQuery(value);
      setPage(1);
    },
    direction,
    setDirection: (value: CommissionsDirection) => {
      setDirection(value);
      setPage(1);
    },
    page,
    setPage,
  };
}
