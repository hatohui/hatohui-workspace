'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionStatusHistoryDto } from '@hatohui/models';

export function CommissionHistoryList({
  history,
}: {
  history: CommissionStatusHistoryDto[];
}) {
  const { t } = useTranslation('art');

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('commission.admin.detail.noHistory')}
      </p>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-sm font-medium">
        {t('commission.admin.detail.history')}
      </h2>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {history.map((entry) => (
          <li key={entry.id}>
            {entry.fromStatus
              ? t(`commission.status.${entry.fromStatus}`)
              : '—'}{' '}
            → {t(`commission.status.${entry.toStatus}`)} ·{' '}
            {new Date(entry.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
