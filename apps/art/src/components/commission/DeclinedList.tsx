'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, Card, CardContent, RichTextView } from '@hatohui/ui';
import type { CommissionDto } from '@hatohui/models';

export function DeclinedList({
  items,
  onRestore,
}: {
  items: CommissionDto[];
  onRestore: (id: string) => void;
}) {
  const { t } = useTranslation('art');

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">
        {t('commission.admin.triage.empty')}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.clientName}</p>
              <RichTextView
                value={item.idea}
                className="line-clamp-1 text-xs text-muted-foreground"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRestore(item.id)}
            >
              {t('commission.admin.triage.restore')}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
