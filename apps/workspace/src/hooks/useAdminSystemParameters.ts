import { useQueryClient } from '@tanstack/react-query';
import {
  getAdminListSystemParametersQueryKey,
  useAdminCreateSystemParameter,
  useAdminListSystemParameters,
  useAdminUpdateSystemParameter,
} from '@hatohui/models';
import type {
  AdminSystemParameterDto,
  CreateAdminSystemParameterDto,
} from '@hatohui/models';

export function useAdminSystemParameters() {
  const queryClient = useQueryClient();
  const queryKey = getAdminListSystemParametersQueryKey();
  const query = useAdminListSystemParameters();
  const updateMutation = useAdminUpdateSystemParameter();
  const createMutation = useAdminCreateSystemParameter();

  const updateValue = (id: string, value: string) => {
    const previous = queryClient.getQueryData<{
      data: AdminSystemParameterDto[];
    }>(queryKey);

    if (previous) {
      queryClient.setQueryData(queryKey, {
        ...previous,
        data: previous.data.map((row) =>
          row.id === id ? { ...row, value } : row,
        ),
      });
    }

    updateMutation.mutate(
      { id, data: { value } },
      {
        onError: () => {
          if (previous) queryClient.setQueryData(queryKey, previous);
        },
        onSettled: () => {
          void query.refetch();
        },
      },
    );
  };

  const createParameter = (dto: CreateAdminSystemParameterDto) => {
    createMutation.mutate(
      { data: dto },
      {
        onSuccess: () => {
          void query.refetch();
        },
      },
    );
  };

  return {
    rows: query.data?.data ?? [],
    isLoading: query.isPending,
    updateValue,
    createParameter,
    isCreating: createMutation.isPending,
  };
}
