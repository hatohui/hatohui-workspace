'use client';

import { useTranslation } from '@hatohui/i18n';
import { QueueTimeline } from './QueueTimeline';
import { OrderLookup } from '@/components/orders/OrderLookup';

export function QueuePageContent() {
  const { t } = useTranslation('art');

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl">{t('queue.title')}</h1>
        <p className="text-muted-foreground">{t('queue.subtitle')}</p>
        <div className="mt-6">
          <QueueTimeline />
        </div>
      </div>
      <div className="border-t border-border pt-8">
        <OrderLookup />
      </div>
    </div>
  );
}
