'use client';

import { useState } from 'react';
import {
  useCommissions,
  type CommissionDtoStatus,
  type CommissionsSort,
  type CommissionsDirection,
} from '@hatohui/models';
import { useDebouncedValue } from '@hatohui/libs';
import { COMMISSION_PAGE_SIZE } from '@/constants/commission';

export function useCommissionsList() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<CommissionDtoStatus | undefined>(
    undefined,
  );
  const [sort, setSort] = useState<CommissionsSort>('createdAt');
  const [direction, setDirection] = useState<CommissionsDirection>('desc');
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebouncedValue(query, 300);

  const commissionsQuery = useCommissions({
    query: debouncedQuery || undefined,
    status,
    sort,
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
    status,
    setStatus: (value: CommissionDtoStatus | undefined) => {
      setStatus(value);
      setPage(1);
    },
    sort,
    setSort,
    direction,
    setDirection,
    page,
    setPage,
    refetch: commissionsQuery.refetch,
  };
}
