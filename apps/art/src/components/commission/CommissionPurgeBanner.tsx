'use client';

import { useTranslation } from '@hatohui/i18n';
import { useCommissionFormatters } from '@/hooks/useCommissionFormatters';

export function CommissionPurgeBanner({
  purgedAt,
  purgeAt,
}: {
  purgedAt: string | null;
  purgeAt: string | null;
}) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();

  if (!purgedAt && !purgeAt) return null;

  return (
    <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      {purgedAt
        ? t('commission.admin.purge.purged', { date: format.date(purgedAt) })
        : t('commission.admin.purge.scheduled', {
            date: format.date(purgeAt),
          })}
    </p>
  );
}
