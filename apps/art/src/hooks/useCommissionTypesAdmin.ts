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
import { invalidatePublicCommissionCache } from './invalidatePublicCommissionCache';

export function useCommissionTypesAdmin() {
  const { t } = useTranslation('art');
  const toast = useToast();
  const queryClient = useQueryClient();
  const queryKey = getMyCommissionTypesQueryKey();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
    invalidatePublicCommissionCache(queryClient);
  };

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

  const reorder = async (orderedIds: string[]) => {
    const previous = queryClient.getQueryData<Cache>(queryKey);
    const enabledById = new Map(
      (previous?.data ?? items).map((row) => [
        row.commissionTypeId,
        row.enabled,
      ]),
    );
    if (previous) {
      const rankById = new Map(orderedIds.map((id, index) => [id, index]));
      queryClient.setQueryData<Cache>(queryKey, {
        ...previous,
        data: [...previous.data]
          .map((row) => ({
            ...row,
            no: rankById.get(row.commissionTypeId) ?? row.no,
          }))
          .sort((a, b) => a.no - b.no),
      });
    }
    try {
      for (let index = 0; index < orderedIds.length; index += 1) {
        const id = orderedIds[index];
        await setEnabled.mutateAsync({
          id,
          data: { active: enabledById.get(id) ?? false, no: index },
        });
      }
    } catch {
      if (previous) queryClient.setQueryData(queryKey, previous);
      toast.error(t('commission.admin.pricing.saveFailed'));
    } finally {
      void invalidate();
    }
  };

  return {
    items,
    isLoading: listQuery.isPending,
    setEnabled: setEnabled.mutateAsync,
    reorder,
  };
}
