import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@hatohui/i18n';
import type { TravelBulkResultDto } from '@hatohui/models';
import { useToast } from '@hatohui/ui';
import { useErrorMessage } from './useErrorMessage';
import { useInvalidateTravel } from './useInvalidateTravel';

export interface OptimisticUpdate<TData> {
  queryKey: readonly unknown[];
  apply: (current: TData) => TData;
}

export function useAdminAction() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const errorMessage = useErrorMessage();
  const invalidate = useInvalidateTravel();

  const run = useCallback(
    async <TData = unknown>(
      action: () => Promise<unknown>,
      optimistic?: OptimisticUpdate<TData>,
    ) => {
      let previous: TData | undefined;
      if (optimistic) {
        await queryClient.cancelQueries({ queryKey: optimistic.queryKey });
        previous = queryClient.getQueryData<TData>(optimistic.queryKey);
        if (previous !== undefined) {
          queryClient.setQueryData<TData>(
            optimistic.queryKey,
            optimistic.apply(previous),
          );
        }
      }

      try {
        await action();
        await invalidate();
        return true;
      } catch (error) {
        if (optimistic && previous !== undefined) {
          queryClient.setQueryData<TData>(optimistic.queryKey, previous);
        }
        toast.error(errorMessage(error));
        return false;
      }
    },
    [errorMessage, invalidate, queryClient, toast],
  );

  const runBulk = useCallback(
    async (action: () => Promise<{ data: TravelBulkResultDto }>) => {
      return run(async () => {
        const { data } = await action();
        toast.success(
          t('admin.bulkResult', {
            created: data.created,
            skipped: data.skipped,
          }),
        );
      });
    },
    [run, t, toast],
  );

  return { run, runBulk };
}
