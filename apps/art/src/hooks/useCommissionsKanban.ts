'use client';

import { useMemo } from 'react';
import { useCommissions, type CommissionDto } from '@hatohui/models';
import { COMMISSION_KANBAN_COLUMNS } from '@/constants/commission';

const KANBAN_FETCH_SIZE = 200;

export function useCommissionsKanban() {
  const commissionsQuery = useCommissions({
    sort: 'createdAt',
    direction: 'desc',
    page: 1,
    pageSize: KANBAN_FETCH_SIZE,
  });

  const columns = useMemo(() => {
    const items = commissionsQuery.data?.data.items ?? [];
    const grouped = new Map<string, CommissionDto[]>();
    for (const status of COMMISSION_KANBAN_COLUMNS) {
      grouped.set(status, []);
    }
    for (const item of items) {
      grouped.get(item.status)?.push(item);
    }
    return grouped;
  }, [commissionsQuery.data]);

  return {
    columns,
    isLoading: commissionsQuery.isPending,
    refetch: commissionsQuery.refetch,
  };
}
