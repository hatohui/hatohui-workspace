import { useCallback } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { TravelBulkResultDto } from '@hatohui/models';
import { useToast } from '@hatohui/ui';
import { useErrorMessage } from './useErrorMessage';
import { useInvalidateTravel } from './useInvalidateTravel';

export function useAdminAction() {
  const { t } = useTranslation();
  const toast = useToast();
  const errorMessage = useErrorMessage();
  const invalidate = useInvalidateTravel();

  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      try {
        await action();
        await invalidate();
        return true;
      } catch (error) {
        toast.error(errorMessage(error));
        return false;
      }
    },
    [errorMessage, invalidate, toast],
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
