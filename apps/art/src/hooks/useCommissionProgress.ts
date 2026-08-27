'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  useCommissionProgress,
  useCommissionProgressByCode,
  useCreateCommissionProgress,
  useUpdateCommissionProgress,
  useFinalizeCommissionProgress,
  useDeleteCommissionProgress,
  getCommissionProgressQueryKey,
  type CreateCommissionProgressDto,
} from '@hatohui/models';

export function useCommissionProgressAdmin(commissionId: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getCommissionProgressQueryKey({ commissionId }),
    });

  const listQuery = useCommissionProgress({ commissionId });
  const create = useCreateCommissionProgress({
    mutation: { onSuccess: invalidate },
  });
  const update = useUpdateCommissionProgress({
    mutation: { onSuccess: invalidate },
  });
  const finalize = useFinalizeCommissionProgress({
    mutation: { onSuccess: invalidate },
  });
  const remove = useDeleteCommissionProgress({
    mutation: { onSuccess: invalidate },
  });

  return {
    items: listQuery.data?.data ?? [],
    isLoading: listQuery.isPending,
    create: (data: Omit<CreateCommissionProgressDto, 'commissionId'>) =>
      create.mutateAsync({ data: { ...data, commissionId } }),
    update: (
      id: string,
      data: Parameters<typeof update.mutateAsync>[0]['data'],
    ) => update.mutateAsync({ id, data }),
    finalize: (id: string, projectId?: string) =>
      finalize.mutateAsync({ id, data: { projectId } }),
    remove: (id: string) => remove.mutateAsync({ id }),
  };
}

export function useCommissionProgressByAccessCode(code: string) {
  const query = useCommissionProgressByCode(code);
  return {
    items: query.data?.data ?? [],
    isLoading: query.isPending,
  };
}
