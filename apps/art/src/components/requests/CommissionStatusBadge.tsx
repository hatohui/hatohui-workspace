'use client';

import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import type { CommissionDto } from '@hatohui/models';
import { COMMISSION_STATUS_TONES } from '@/constants/commission';

export function CommissionStatusBadge({
  status,
}: {
  status: CommissionDto['status'];
}) {
  const { t } = useTranslation('art');

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        COMMISSION_STATUS_TONES[status],
      )}
    >
      {t(`commission.status.${status}`)}
    </span>
  );
}
