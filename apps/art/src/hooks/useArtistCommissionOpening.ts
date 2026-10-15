'use client';

import { ApiError, useCurrentCommissionOpening } from '@hatohui/models';

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
    isUnknown:
      query.isError &&
      !(query.error instanceof ApiError && query.error.status === 404),
  };
}
