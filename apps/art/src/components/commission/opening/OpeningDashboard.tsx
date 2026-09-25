'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  ConfirmDialog,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@hatohui/ui';
import type {
  CommissionOpeningDto,
  UpsertCommissionOpeningDto,
} from '@hatohui/models';
import { OPENING_DASHBOARD_TABS } from '@/constants/commission';
import { useOpeningDashboard } from '@/hooks/useOpeningDashboard';
import { OpeningStatusBadge } from './OpeningStatusBadge';
import { OpeningStatTiles } from './OpeningStatTiles';
import { OpeningHistoryTable } from './OpeningHistoryTable';
import { OpeningForm } from './OpeningForm';

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
  const dashboard = useOpeningDashboard(active, onOpenNow, onClose);

  return (
    <div className="space-y-6">
      <section className="space-y-5 rounded-lg border border-border p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <OpeningStatusBadge status={active.status} />
            {dashboard.supportingLine && (
              <p className="text-sm text-muted-foreground">
                {dashboard.supportingLine}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {dashboard.canOpenNow && (
              <Button
                size="sm"
                disabled={dashboard.isBusy}
                onClick={dashboard.openNow}
              >
                {t('commission.admin.opening.openNow')}
              </Button>
            )}
            {dashboard.canClose && (
              <Button
                size="sm"
                variant="outline"
                disabled={dashboard.isBusy}
                onClick={dashboard.requestClose}
              >
                {t('commission.admin.opening.closeNow')}
              </Button>
            )}
          </div>
        </div>
        <OpeningStatTiles opening={active} />
      </section>

      <Tabs value={dashboard.tab} onValueChange={dashboard.setTab}>
        <TabsList>
          {OPENING_DASHBOARD_TABS.map((name) => (
            <TabsTrigger key={name} value={name}>
              {t(`commission.admin.opening.tabs.${name}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <section className="rounded-lg border border-border p-6">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">
              {t('commission.admin.opening.editHeading')}
            </h2>
            <OpeningForm key={active.id} initial={active} onSubmit={onUpdate} />
          </section>
        </TabsContent>
        <TabsContent value="history">
          <OpeningHistoryTable items={history} onSelect={onSelectHistory} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={dashboard.isConfirmingClose}
        title={t('commission.admin.opening.closeConfirmTitle')}
        description={t('commission.admin.opening.closeConfirmBody')}
        cancelLabel={t('commission.admin.opening.closeConfirmCancel')}
        confirmLabel={t('commission.admin.opening.closeConfirmSubmit')}
        onCancel={dashboard.cancelClose}
        onConfirm={dashboard.confirmClose}
      />
    </div>
  );
}
