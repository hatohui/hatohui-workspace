'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { CommissionPublicDetailDto } from '@hatohui/models';
import { useCommissionFormatters } from '@/hooks/useCommissionFormatters';
import { QUEUE_ROUTE } from '@/constants/queue';

export function OrderHeader({
  commission,
}: {
  commission: CommissionPublicDetailDto;
}) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();

  const summary = commission.deliveredAt
    ? t('orders.deliveredAt', { date: format.date(commission.deliveredAt) })
    : commission.queue
      ? t('orders.position', {
          position: commission.queue.position,
          total: commission.queue.total,
        })
      : t(`commission.status.${commission.status}`);

  return (
    <header className="space-y-3">
      <Link
        href={QUEUE_ROUTE}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t('orders.backToQueue')}
      </Link>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {t('orders.greeting', { name: commission.clientName })}
        </p>
        <h1 className="font-serif text-3xl">
          {format.type(
            commission.commissionTypeKey,
            commission.commissionTypeLabel,
          )}
        </h1>
        <p className="text-muted-foreground">{summary}</p>
      </div>
    </header>
  );
}
