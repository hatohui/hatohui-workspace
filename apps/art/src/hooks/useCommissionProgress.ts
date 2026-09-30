'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCommissionProgress,
  useCommissionProgressByCode,
  useCreateCommissionProgress,
  useUpdateCommissionProgress,
  useFinalizeCommissionProgress,
  useDeleteCommissionProgress,
  useCreateCommissionNote,
  useMarkCommissionSeenByArtist,
  getCommissionProgressQueryKey,
  type CreateCommissionProgressDto,
} from '@hatohui/models';
import { useMarkSeenOnce } from './useMarkSeenOnce';
import type { CommentInput } from './useCommentComposer';

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
  const addComment = useCreateCommissionNote({
    mutation: { onSuccess: invalidate },
  });
  const { mutate: markSeen } = useMarkCommissionSeenByArtist();
  useMarkSeenOnce(
    listQuery.isSuccess,
    useCallback(() => markSeen({ id: commissionId }), [markSeen, commissionId]),
  );

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
    comment: (progressId: string, input: CommentInput) =>
      addComment.mutateAsync({
        id: commissionId,
        data: { ...input, progressId, visibility: 'CLIENT' },
      }),
  };
}

export function useCommissionProgressByAccessCode(code: string) {
  const query = useCommissionProgressByCode(code);
  return {
    items: query.data?.data ?? [],
    isLoading: query.isPending,
  };
}
