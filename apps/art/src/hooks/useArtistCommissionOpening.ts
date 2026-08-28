'use client';

import { useCurrentCommissionOpening } from '@hatohui/models';

export function useArtistCommissionOpening(artistId: string) {
  const query = useCurrentCommissionOpening(
    { artistId },
    { query: { retry: false } },
  );
  const opening = query.data?.data;

  return {
    opening,
    isOpen: opening?.status === 'OPEN',
    isLoading: query.isPending,
  };
}
