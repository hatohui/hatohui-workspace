'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  useCommissionGroupByCode,
  usePostCommissionGroupComment,
  getCommissionGroupByCodeQueryKey,
} from '@hatohui/models';

export function useCommissionGroup(code: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getCommissionGroupByCodeQueryKey(code),
    });

  const query = useCommissionGroupByCode(code);
  const postComment = usePostCommissionGroupComment({
    mutation: { onSuccess: invalidate },
  });

  return {
    group: query.data?.data,
    isLoading: query.isPending,
    postComment: (memberAccessCode: string, body: string) =>
      postComment.mutateAsync({ code, data: { memberAccessCode, body } }),
    isPosting: postComment.isPending,
  };
}
