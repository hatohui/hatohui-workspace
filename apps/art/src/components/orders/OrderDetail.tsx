'use client';

import { useTranslation } from '@hatohui/i18n';
import { Skeleton } from '@hatohui/ui';
import { useCommissionCodeLookup } from '@/hooks/useCommissionLookup';
import { OrderHeader } from './OrderHeader';
import { OrderStageTracker } from './OrderStageTracker';
import { OrderFacts } from './OrderFacts';
import { OrderPurgeNotice } from './OrderPurgeNotice';
import { OrderTabs } from './OrderTabs';
import { ImagePreviewProvider } from '@/components/shared/ImagePreviewProvider';

export function OrderDetail({ code }: { code: string }) {
  const { t } = useTranslation('art');
  const lookup = useCommissionCodeLookup(code);
  const commission = lookup.commission;

  if (lookup.isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  if (!commission)
    return (
      <p className="text-muted-foreground">{t('common:errors.notFound')}</p>
    );

  return (
    <div className="space-y-8">
      <OrderHeader commission={commission} />
      {commission.queue && <OrderStageTracker placement={commission.queue} />}
      <OrderFacts commission={commission} />
      <OrderPurgeNotice purgeAt={commission.purgeAt} />
      <ImagePreviewProvider>
        <OrderTabs code={code} commission={commission} lookup={lookup} />
      </ImagePreviewProvider>
    </div>
  );
}
