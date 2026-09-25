'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@hatohui/i18n';
import { useToast } from '@hatohui/ui';
import {
  useUpdateCommissionStatus,
  getArtistDashboardQueryKey,
  getCommissionQueryKey,
  getCommissionsQueryKey,
  type CommissionDto,
  type commissionResponse,
  type commissionsResponse,
} from '@hatohui/models';

type Status = CommissionDto['status'];

export function useCommissionRequestActions() {
  const { t } = useTranslation('art');
  const toast = useToast();
  const queryClient = useQueryClient();
  const listKey = getCommissionsQueryKey();

  const mutation = useUpdateCommissionStatus({
    mutation: {
      onMutate: async ({ id, data }) => {
        await queryClient.cancelQueries({ queryKey: listKey });
        const lists = queryClient.getQueriesData<commissionsResponse>({
          queryKey: listKey,
        });
        const detail = queryClient.getQueryData<commissionResponse>(
          getCommissionQueryKey(id),
        );

        queryClient.setQueriesData<commissionsResponse>(
          { queryKey: listKey },
          (old) =>
            old && {
              ...old,
              data: {
                ...old.data,
                items: old.data.items.map((item) =>
                  item.id === id ? { ...item, status: data.status } : item,
                ),
              },
            },
        );
        if (detail) {
          queryClient.setQueryData<commissionResponse>(
            getCommissionQueryKey(id),
            { ...detail, data: { ...detail.data, status: data.status } },
          );
        }
        return { lists, detail };
      },
      onError: (_error, { id }, context) => {
        context?.lists.forEach(([key, value]) =>
          queryClient.setQueryData(key, value),
        );
        if (context?.detail) {
          queryClient.setQueryData(getCommissionQueryKey(id), context.detail);
        }
        toast.error(t('app.requests.statusFailed'));
      },
      onSettled: (_data, _error, { id }) => {
        void queryClient.invalidateQueries({ queryKey: listKey });
        void queryClient.invalidateQueries({
          queryKey: getCommissionQueryKey(id),
        });
        void queryClient.invalidateQueries({
          queryKey: getArtistDashboardQueryKey(),
        });
      },
    },
  });

  const setStatus = (id: string, status: Status) =>
    mutation.mutate({ id, data: { status } });

  return {
    setStatus,
    accept: (id: string) => setStatus(id, 'ACCEPTED'),
    decline: (id: string) => setStatus(id, 'DECLINED'),
  };
}
