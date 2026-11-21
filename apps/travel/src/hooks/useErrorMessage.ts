import { useCallback } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { ApiError } from '@hatohui/models';
import { getErrorCategory } from '@hatohui/libs';
import { CONFLICT_STATUS } from '../constants/travel';

export function useErrorMessage() {
  const { t } = useTranslation();
  return useCallback(
    (error: unknown) =>
      error instanceof ApiError && error.status === CONFLICT_STATUS
        ? t('form.duplicate')
        : t(`common:errors.${getErrorCategory(error)}`),
    [t],
  );
}
