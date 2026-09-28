'use client';

import { useMemo } from 'react';
import { useCommissionQueue as useCommissionQueueQuery } from '@hatohui/models';

export function useCommissionQueue(artistId: string) {
  const query = useCommissionQueueQuery({ artistId });
  const items = useMemo(() => query.data?.data.items ?? [], [query.data]);
  const revealKey = items.map((item) => item.id).join(',');

  return {
    items,
    revealKey,
    isLoading: query.isPending,
  };
}
