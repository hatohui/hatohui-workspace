'use client';

import { useTranslation } from '@hatohui/i18n';
import { ApiError } from '@hatohui/models';
import { HTTP_FORBIDDEN, HTTP_TOO_MANY_REQUESTS } from '@/constants/queue';

export function usePasscodeError() {
  const { t } = useTranslation('art');

  return (error: unknown): string | null => {
    if (!error) return null;
    if (error instanceof ApiError && error.status === HTTP_FORBIDDEN)
      return t('queue.passcode.wrong');
    if (error instanceof ApiError && error.status === HTTP_TOO_MANY_REQUESTS)
      return t('queue.passcode.tooMany');
    return t('queue.passcode.failed');
  };
}
