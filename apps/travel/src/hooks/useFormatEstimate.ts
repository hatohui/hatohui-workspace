import { useCallback } from 'react';
import { useTranslation } from '@hatohui/i18n';

export function useFormatEstimate() {
  const { i18n } = useTranslation();
  return useCallback(
    (amount: number, currency: string) =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(amount),
    [i18n.language],
  );
}
