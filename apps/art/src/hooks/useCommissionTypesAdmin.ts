'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  useMyCommissionTypes,
  useSetArtistCommissionTypeEnabled,
  getMyCommissionTypesQueryKey,
} from '@hatohui/models';

export function useCommissionTypesAdmin() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getMyCommissionTypesQueryKey(),
    });

  const listQuery = useMyCommissionTypes();
  const setEnabled = useSetArtistCommissionTypeEnabled({
    mutation: { onSuccess: invalidate },
  });

  return {
    items: listQuery.data?.data ?? [],
    isLoading: listQuery.isPending,
    setEnabled: setEnabled.mutateAsync,
  };
}
