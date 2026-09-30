'use client';

import { useTranslation } from '@hatohui/i18n';
import { useCommissionFormatters } from '@/hooks/useCommissionFormatters';

export function OrderPurgeNotice({ purgeAt }: { purgeAt: string | null }) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();

  if (!purgeAt) return null;

  return (
    <p className="rounded-xl border border-border bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
      {t('orders.purgeNotice', { date: format.date(purgeAt) })}
    </p>
  );
}
