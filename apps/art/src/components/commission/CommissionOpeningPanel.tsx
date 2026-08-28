'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useCommissionOpeningsAdmin } from '@/hooks/useCommissionOpenings';
import { OpeningDashboard } from './opening/OpeningDashboard';
import { OpeningEmptyView } from './opening/OpeningEmptyView';
import { OpeningDetail } from './opening/OpeningDetail';

export function CommissionOpeningPanel() {
  const { t } = useTranslation('art');
  const { items, active, history, isLoading, create, update, open, close } =
    useCommissionOpeningsAdmin();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId
    ? items.find((item) => item.id === selectedId)
    : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-1">
        <h1 className="font-serif text-2xl">
          {t('commission.admin.opening.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('commission.admin.opening.oneWindowHint')}
        </p>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common:loading')}</p>
      ) : selected ? (
        <OpeningDetail opening={selected} onBack={() => setSelectedId(null)} />
      ) : active ? (
        <OpeningDashboard
          active={active}
          history={history}
          onOpenNow={() => open(active.id)}
          onClose={() => close(active.id)}
          onUpdate={(dto) => update({ id: active.id, data: dto })}
          onSelectHistory={setSelectedId}
        />
      ) : (
        <OpeningEmptyView
          history={history}
          onCreate={(dto) => create({ data: dto })}
          onSelectHistory={setSelectedId}
        />
      )}
    </div>
  );
}
