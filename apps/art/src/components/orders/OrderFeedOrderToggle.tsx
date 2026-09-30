'use client';

import { ArrowDownUp } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

export function OrderFeedOrderToggle({
  isNewestFirst,
  onFlip,
}: {
  isNewestFirst: boolean;
  onFlip: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="flex justify-end">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={onFlip}
      >
        <ArrowDownUp aria-hidden />
        {isNewestFirst ? t('orders.newestFirst') : t('orders.oldestFirst')}
      </Button>
    </div>
  );
}
