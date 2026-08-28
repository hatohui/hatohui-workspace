'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@hatohui/i18n';
import { useToast } from '@hatohui/ui';
import {
  useMyCommissionTypes,
  useSetArtistCommissionTypeEnabled,
  getMyCommissionTypesQueryKey,
} from '@hatohui/models';
import type { ArtistCommissionTypeDto } from '@hatohui/models';

export function useCommissionTypesAdmin() {
  const { t } = useTranslation('art');
  const toast = useToast();
  const queryClient = useQueryClient();
  const queryKey = getMyCommissionTypesQueryKey();
  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const listQuery = useMyCommissionTypes();
  type Cache = NonNullable<typeof listQuery.data>;

  const setEnabled = useSetArtistCommissionTypeEnabled<
    unknown,
    { previous: Cache | undefined }
  >({
    mutation: {
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData<Cache>(queryKey);
        if (previous) {
          const rows: ArtistCommissionTypeDto[] = previous.data.map((row) =>
            row.commissionTypeId === id
              ? { ...row, enabled: data.active ?? row.enabled }
              : row,
          );
          queryClient.setQueryData<Cache>(queryKey, {
            ...previous,
            data: rows,
          });
        }
        return { previous };
      },
      onError: (_error, _variables, context) => {
        if (context?.previous) {
          queryClient.setQueryData(queryKey, context.previous);
        }
        toast.error(t('commission.admin.pricing.saveFailed'));
      },
      onSettled: invalidate,
    },
  });

  return {
    items: listQuery.data?.data ?? [],
    isLoading: listQuery.isPending,
    setEnabled: setEnabled.mutateAsync,
  };
}
