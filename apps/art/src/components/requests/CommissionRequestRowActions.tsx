'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { Check, X } from 'lucide-react';

export function CommissionRequestRowActions({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <div
      className="flex justify-end gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <Button size="sm" onClick={onAccept}>
        <Check className="size-4" aria-hidden />
        {t('commission.admin.triage.accept')}
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label={t('commission.admin.triage.decline')}
        onClick={onDecline}
      >
        <X className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
