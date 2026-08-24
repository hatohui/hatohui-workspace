'use client';

import { useTranslation } from '@hatohui/i18n';

export function useCommissionDisplayLabel() {
  const { t } = useTranslation('art');

  return (commissionTypeKey: string | null, clientName?: string) => {
    const typeLabel = commissionTypeKey
      ? t(`commission.type.${commissionTypeKey}.label`, {
          defaultValue: commissionTypeKey,
        })
      : null;

    if (typeLabel && clientName) return `${typeLabel} — ${clientName}`;
    return typeLabel ?? clientName ?? t('commission.admin.title');
  };
}
