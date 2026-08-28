'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, ConfirmDialog } from '@hatohui/ui';
import type {
  CommissionOpeningDto,
  UpsertCommissionOpeningDto,
} from '@hatohui/models';
import {
  OPENING_DASHBOARD_TABS,
  type OpeningDashboardTab,
} from '@/constants/commission';
import { OpeningStatusBadge } from './OpeningStatusBadge';
import { OpeningStatTiles } from './OpeningStatTiles';
import { OpeningHistoryTable } from './OpeningHistoryTable';
import { OpeningForm } from './OpeningForm';

function supportingLine(
  active: CommissionOpeningDto,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string | null {
  if (active.status === 'SCHEDULED' && active.scheduledAt)
    return t('commission.admin.opening.scheduledFor', {
      date: new Date(active.scheduledAt).toLocaleString(),
    });
  if (active.status === 'OPEN' && active.openedAt)
    return t('commission.admin.opening.openSince', {
      date: new Date(active.openedAt).toLocaleDateString(),
    });
  return null;
}

export function OpeningDashboard({
  active,
  history,
  onOpenNow,
  onClose,
  onUpdate,
  onSelectHistory,
}: {
  active: CommissionOpeningDto;
  history: CommissionOpeningDto[];
  onOpenNow: () => Promise<unknown>;
  onClose: () => Promise<unknown>;
  onUpdate: (dto: UpsertCommissionOpeningDto) => Promise<unknown>;
  onSelectHistory: (id: string) => void;
}) {
  const { t } = useTranslation('art');
  const [tab, setTab] = useState<OpeningDashboardTab>('overview');
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-5 rounded-lg border border-border p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <OpeningStatusBadge status={active.status} />
            {supportingLine(active, t) && (
              <p className="text-sm text-muted-foreground">
                {supportingLine(active, t)}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {active.status === 'SCHEDULED' && (
              <Button
                size="sm"
                disabled={busy}
                onClick={() => void run(onOpenNow)}
              >
                {t('commission.admin.opening.openNow')}
              </Button>
            )}
            {active.status === 'OPEN' && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => setConfirmingClose(true)}
              >
                {t('commission.admin.opening.closeNow')}
              </Button>
            )}
          </div>
        </div>
        <OpeningStatTiles opening={active} />
      </section>

      <div className="flex gap-1 border-b border-border pb-2">
        {OPENING_DASHBOARD_TABS.map((name) => (
          <Button
            key={name}
            size="sm"
            variant={tab === name ? 'default' : 'ghost'}
            onClick={() => setTab(name)}
          >
            {t(`commission.admin.opening.tabs.${name}`)}
          </Button>
        ))}
      </div>

      {tab === 'overview' ? (
        <section className="rounded-lg border border-border p-6">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            {t('commission.admin.opening.editHeading')}
          </h2>
          <OpeningForm key={active.id} initial={active} onSubmit={onUpdate} />
        </section>
      ) : (
        <OpeningHistoryTable items={history} onSelect={onSelectHistory} />
      )}

      <ConfirmDialog
        open={confirmingClose}
        title={t('commission.admin.opening.closeConfirmTitle')}
        description={t('commission.admin.opening.closeConfirmBody')}
        cancelLabel={t('commission.admin.opening.closeConfirmCancel')}
        confirmLabel={t('commission.admin.opening.closeConfirmSubmit')}
        onCancel={() => setConfirmingClose(false)}
        onConfirm={() => {
          setConfirmingClose(false);
          void run(onClose);
        }}
      />
    </div>
  );
}
