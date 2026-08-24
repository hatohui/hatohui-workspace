'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionQueueItemDto } from '@hatohui/models';
import { Card, CardContent } from '@hatohui/ui';
import { useCommissionDisplayLabel } from '@/hooks/useCommissionDisplayLabel';

export function QueueTimelineItem({ item }: { item: CommissionQueueItemDto }) {
  const { t } = useTranslation('art');
  const displayLabel = useCommissionDisplayLabel();

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium">{displayLabel(item.commissionTypeKey)}</p>
        </div>
        <span className="text-sm text-muted-foreground">
          {t(`commission.status.${item.status}`)}
        </span>
      </CardContent>
    </Card>
  );
}
