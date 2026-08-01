'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionQueueItemDto } from '@hatohui/models';
import { Card, CardContent } from '@hatohui/ui';

export function QueueTimelineItem({ item }: { item: CommissionQueueItemDto }) {
  const { t } = useTranslation('art');

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium">{item.title}</p>
          {item.commissionType && (
            <p className="text-xs text-muted-foreground">
              {t(`commission.type.${item.commissionType}.label`)}
            </p>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {t(`commission.status.${item.status}`)}
        </span>
      </CardContent>
    </Card>
  );
}
