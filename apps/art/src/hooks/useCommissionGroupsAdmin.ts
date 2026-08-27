'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  useMyCommissionGroups,
  useCreateCommissionGroup,
  useUpdateCommissionGroup,
  useAddCommissionGroupMember,
  useRemoveCommissionGroupMember,
  getMyCommissionGroupsQueryKey,
} from '@hatohui/models';

export function useCommissionGroupsAdmin() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getMyCommissionGroupsQueryKey(),
    });

  const listQuery = useMyCommissionGroups();
  const create = useCreateCommissionGroup({
    mutation: { onSuccess: invalidate },
  });
  const update = useUpdateCommissionGroup({
    mutation: { onSuccess: invalidate },
  });
  const addMember = useAddCommissionGroupMember({
    mutation: { onSuccess: invalidate },
  });
  const removeMember = useRemoveCommissionGroupMember({
    mutation: { onSuccess: invalidate },
  });

  return {
    items: listQuery.data?.data ?? [],
    isLoading: listQuery.isPending,
    create: (title: string) => create.mutateAsync({ data: { title } }),
    update: (
      id: string,
      data: Parameters<typeof update.mutateAsync>[0]['data'],
    ) => update.mutateAsync({ id, data }),
    addMember: (id: string, email: string, name?: string) =>
      addMember.mutateAsync({ id, data: { email, name } }),
    removeMember: (id: string, clientId: string) =>
      removeMember.mutateAsync({ id, clientId }),
  };
}
