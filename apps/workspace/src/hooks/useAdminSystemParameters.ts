import { useQueryClient } from '@tanstack/react-query';
import {
  getAdminListSystemParametersQueryKey,
  useAdminListSystemParameters,
  useAdminUpdateSystemParameter,
} from '@hatohui/models';
import type { AdminSystemParameterDto } from '@hatohui/models';

export function useAdminSystemParameters() {
  const queryClient = useQueryClient();
  const queryKey = getAdminListSystemParametersQueryKey();
  const query = useAdminListSystemParameters();
  const updateMutation = useAdminUpdateSystemParameter();

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

  return {
    rows: query.data?.data ?? [],
    isLoading: query.isPending,
    updateValue,
  };
}
