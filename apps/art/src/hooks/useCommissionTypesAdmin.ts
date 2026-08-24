'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  useCommissionTypes,
  useCreateCommissionType,
  useUpdateCommissionType,
  useDeleteCommissionType,
  getCommissionTypesQueryKey,
} from '@hatohui/models';

export function useCommissionTypesAdmin() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getCommissionTypesQueryKey({ includeInactive: true }),
    });

  const listQuery = useCommissionTypes({ includeInactive: true });
  const create = useCreateCommissionType({
    mutation: { onSuccess: invalidate },
  });
  const update = useUpdateCommissionType({
    mutation: { onSuccess: invalidate },
  });
  const remove = useDeleteCommissionType({
    mutation: { onSuccess: invalidate },
  });

  return {
    items: listQuery.data?.data ?? [],
    isLoading: listQuery.isPending,
    create: create.mutateAsync,
    update: update.mutateAsync,
    remove: (id: string) => remove.mutateAsync({ id }),
  };
}
