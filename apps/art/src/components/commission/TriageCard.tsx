'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, Card, CardContent, RichTextView } from '@hatohui/ui';
import type { CommissionDto } from '@hatohui/models';
import { ReferenceThumbnail } from './ReferenceThumbnail';

export function TriageCard({
  commission,
  onAccept,
  onDecline,
}: {
  commission: CommissionDto;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <Card>
      <CardContent className="flex gap-3 p-3">
        <ReferenceThumbnail url={commission.referenceAssets[0]} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">
              {commission.clientName}
            </p>
            {commission.quote != null && (
              <span className="shrink-0 text-sm text-muted-foreground">
                ${(commission.quote / 100).toFixed(2)}
              </span>
            )}
          </div>
          {commission.contactHandle && (
            <p className="truncate text-xs text-muted-foreground">
              {commission.contactHandle}
            </p>
          )}
          <RichTextView
            value={commission.idea}
            className="line-clamp-2 text-xs text-muted-foreground"
          />
          {(onAccept || onDecline) && (
            <div className="flex gap-2 pt-1">
              {onAccept && (
                <Button size="sm" onClick={onAccept}>
                  {t('commission.admin.triage.accept')}
                </Button>
              )}
              {onDecline && (
                <Button size="sm" variant="outline" onClick={onDecline}>
                  {t('commission.admin.triage.decline')}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
