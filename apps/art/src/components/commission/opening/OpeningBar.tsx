'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, ConfirmDialog, Skeleton } from '@hatohui/ui';
import { useOpeningBar } from '@/hooks/useOpeningBar';
import { OpeningStatusBadge } from './OpeningStatusBadge';
import { OpeningOptionsSheet } from './OpeningOptionsSheet';

export function OpeningBar() {
  const { t } = useTranslation('art');
  const bar = useOpeningBar();

  if (bar.isLoading) return <Skeleton className="h-20 w-full" />;

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border px-5 py-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <OpeningStatusBadge status={bar.status} />
          <p className="font-medium">{bar.headline}</p>
        </div>
        {(bar.slots ?? bar.waiting) && (
          <p className="text-sm text-muted-foreground">
            {[bar.slots, bar.waiting].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {bar.canOpenNow && (
          <Button size="sm" disabled={bar.isBusy} onClick={bar.openNow}>
            {t('commission.admin.opening.openNow')}
          </Button>
        )}
        {bar.canClose && (
          <Button
            size="sm"
            variant="outline"
            disabled={bar.isBusy}
            onClick={bar.requestClose}
          >
            {t('commission.admin.opening.closeNow')}
          </Button>
        )}
        <Button
          size="sm"
          variant={bar.active ? 'ghost' : 'default'}
          onClick={() => bar.setIsOptionsOpen(true)}
        >
          {bar.active
            ? t('app.commissions.opening.options')
            : t('app.commissions.opening.openCommissions')}
        </Button>
      </div>

      <OpeningOptionsSheet bar={bar} />
      <ConfirmDialog
        open={bar.isConfirmingClose}
        title={t('commission.admin.opening.closeConfirmTitle')}
        description={t('commission.admin.opening.closeConfirmBody')}
        cancelLabel={t('commission.admin.opening.closeConfirmCancel')}
        confirmLabel={t('commission.admin.opening.closeConfirmSubmit')}
        onCancel={bar.cancelClose}
        onConfirm={bar.confirmClose}
      />
    </section>
  );
}
