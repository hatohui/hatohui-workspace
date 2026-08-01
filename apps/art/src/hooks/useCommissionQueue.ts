'use client';

import { useCommissionQueue as useCommissionQueueQuery } from '@hatohui/models';

export function useCommissionQueue() {
  const query = useCommissionQueueQuery();
  return {
    items: query.data?.data.items ?? [],
    isLoading: query.isPending,
  };
}
