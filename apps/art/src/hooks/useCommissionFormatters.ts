'use client';

import { useTranslation } from '@hatohui/i18n';
import { EMPTY_VALUE } from '@/constants/commission';

export function useCommissionFormatters() {
  const { t, i18n } = useTranslation('art');

  return {
    date: (value: string | null) =>
      value ? new Date(value).toLocaleDateString(i18n.language) : EMPTY_VALUE,

    money: (amount: number | null, currency: string) =>
      amount == null
        ? EMPTY_VALUE
        : new Intl.NumberFormat(i18n.language, {
            style: 'currency',
            currency,
          }).format(amount / 100),

    type: (commissionTypeKey: string | null) =>
      commissionTypeKey
        ? t(`commission.type.${commissionTypeKey}.label`, {
            defaultValue: commissionTypeKey,
          })
        : EMPTY_VALUE,
  };
}
