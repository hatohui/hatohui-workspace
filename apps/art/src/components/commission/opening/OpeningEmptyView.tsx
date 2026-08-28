'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@hatohui/ui';
import type {
  CommissionOpeningDto,
  UpsertCommissionOpeningDto,
} from '@hatohui/models';
import { OpeningHistoryTable } from './OpeningHistoryTable';
import { OpeningForm } from './OpeningForm';

export function OpeningEmptyView({
  history,
  onCreate,
  onSelectHistory,
}: {
  history: CommissionOpeningDto[];
  onCreate: (dto: UpsertCommissionOpeningDto) => Promise<unknown>;
  onSelectHistory: (id: string) => void;
}) {
  const { t } = useTranslation('art');
  const [creating, setCreating] = useState(false);

  if (creating) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => setCreating(false)}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t('commission.admin.opening.back')}
        </Button>
        <section className="rounded-lg border border-border p-6">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            {t('commission.admin.opening.newHeading')}
          </h2>
          <OpeningForm
            onSubmit={async (dto) => {
              await onCreate(dto);
              setCreating(false);
            }}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t('commission.admin.opening.history')}
        </h2>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-4" aria-hidden />
          {t('commission.admin.opening.openCommission')}
        </Button>
      </div>
      <OpeningHistoryTable items={history} onSelect={onSelectHistory} />
    </div>
  );
}
