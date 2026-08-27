'use client';

import { useCommissionQueue as useCommissionQueueQuery } from '@hatohui/models';

export function useCommissionQueue(artistId: string) {
  const query = useCommissionQueueQuery({ artistId });
  return {
    items: query.data?.data.items ?? [],
    isLoading: query.isPending,
  };
}
