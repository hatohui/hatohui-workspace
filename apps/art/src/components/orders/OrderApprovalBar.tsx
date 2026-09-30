'use client';

import { CircleCheck } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import type { OrderApproval } from '@/hooks/useOrderUpdates';
import { useCommissionFormatters } from '@/hooks/useCommissionFormatters';

export function OrderApprovalBar({
  approval,
  onApprove,
}: {
  approval: OrderApproval;
  onApprove: () => void;
}) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();

  if (approval.approvedAt)
    return (
      <p className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm">
        <CircleCheck className="size-4 shrink-0 text-primary" aria-hidden />
        {t('orders.approval.approved', {
          date: format.date(approval.approvedAt),
        })}
      </p>
    );

  return (
    <div className="space-y-2 rounded-lg border border-primary/40 bg-primary/5 p-3">
      <p className="text-sm font-medium">{t('orders.approval.prompt')}</p>
      <p className="text-xs text-muted-foreground">
        {t('orders.approval.changesHint')}
      </p>
      <Button
        className="w-full sm:w-auto"
        disabled={approval.isApproving}
        onClick={onApprove}
      >
        {approval.isApproving
          ? t('orders.approval.approving')
          : t('orders.approval.approve')}
      </Button>
    </div>
  );
}
