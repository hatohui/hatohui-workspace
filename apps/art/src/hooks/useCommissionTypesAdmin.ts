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

  const items = listQuery.data?.data ?? [];

  const move = async (commissionTypeId: string, direction: 'up' | 'down') => {
    const ordered = [...items].sort((a, b) => a.no - b.no);
    const index = ordered.findIndex(
      (row) => row.commissionTypeId === commissionTypeId,
    );
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || swapWith < 0 || swapWith >= ordered.length) return;
    const a = ordered[index];
    const b = ordered[swapWith];
    await Promise.all([
      setEnabled.mutateAsync({
        id: a.commissionTypeId,
        data: { active: a.enabled, no: b.no },
      }),
      setEnabled.mutateAsync({
        id: b.commissionTypeId,
        data: { active: b.enabled, no: a.no },
      }),
    ]);
  };

  return {
    items,
    isLoading: listQuery.isPending,
    setEnabled: setEnabled.mutateAsync,
    move,
  };
}
