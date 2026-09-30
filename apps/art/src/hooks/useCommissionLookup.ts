'use client';

import {
  useLookupCommissionByCode,
  useAddClientCommissionNote,
  useApproveCommissionProgress,
  getLookupCommissionByCodeQueryKey,
  getCommissionProgressByCodeQueryKey,
} from '@hatohui/models';
import { useQueryClient } from '@tanstack/react-query';
import type { CommentInput } from './useCommentComposer';

export function useCommissionCodeLookup(code: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getLookupCommissionByCodeQueryKey(code),
    });
  const invalidateProgress = () =>
    queryClient.invalidateQueries({
      queryKey: getCommissionProgressByCodeQueryKey(code),
    });

  const detailQuery = useLookupCommissionByCode(code);
  const addNote = useAddClientCommissionNote({
    mutation: { onSuccess: invalidate },
  });
  const approve = useApproveCommissionProgress({
    mutation: {
      onSuccess: () => Promise.all([invalidate(), invalidateProgress()]),
    },
  });

  return {
    commission: detailQuery.data?.data,
    isLoading: detailQuery.isPending,

    addNote: async (input: CommentInput, progressId?: string) => {
      await addNote.mutateAsync({ code, data: { ...input, progressId } });
      if (progressId) await invalidateProgress();
    },

    approve: (progressId: string) =>
      approve.mutateAsync({ code, id: progressId }),
    approvingId: approve.isPending ? approve.variables.id : null,
  };
}
