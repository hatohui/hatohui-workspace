import { useAdminListUsers, useAdminUpdateUser } from '@hatohui/models';
import type { UpdateAdminUserDto } from '@hatohui/models';

export function useAdminUsers() {
  const query = useAdminListUsers();
  const updateMutation = useAdminUpdateUser();

  const updateField = (
    id: string,
    key: keyof UpdateAdminUserDto,
    value: string,
  ) => {
    updateMutation.mutate(
      { id, data: { [key]: value } },
      {
        onSuccess: () => {
          void query.refetch();
        },
      },
    );
  };

  return {
    users: query.data?.data ?? [],
    isLoading: query.isPending,
    error: query.error,
    updateField,
  };
}
