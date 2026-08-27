'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { LayoutGrid, List } from 'lucide-react';
import type { CommissionDto, CommissionsSort } from '@hatohui/models';
import {
  TRIAGE_SORT_OPTIONS,
  TRIAGE_TABS,
  TRIAGE_VIEW_MODES,
  type TriageViewMode,
} from '@/constants/commission';
import { useCommissionTriage } from '@/hooks/useCommissionTriage';
import { useUndoableAction } from '@/hooks/useUndoableAction';
import { TriageCard } from './TriageCard';
import { TriageTable } from './TriageTable';
import { AcceptedSlotsTable } from './AcceptedSlotsTable';
import { DeclinedList } from './DeclinedList';
import { ConfirmationNoteDialog } from './ConfirmationNoteDialog';

export function TriageBoard() {
  const { t } = useTranslation('art');
  const [tab, setTab] = useState<CommissionDto['status']>('PENDING');
  const [sort, setSort] = useState<CommissionsSort>('createdAt');
  const [view, setView] = useState<TriageViewMode>('card');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const pending = useCommissionTriage('PENDING', sort, 'asc');
  const accepted = useCommissionTriage('ACCEPTED', sort, 'asc');
  const declined = useCommissionTriage('DECLINED', sort, 'asc');
  const {
    pending: pendingUndo,
    run: runUndoable,
    confirmUndo,
  } = useUndoableAction();

  const active =
    tab === 'PENDING' ? pending : tab === 'ACCEPTED' ? accepted : declined;

  const accept = (id: string) =>
    runUndoable(
      t('commission.admin.triage.acceptedToast'),
      () => void pending.setStatus(id, 'ACCEPTED'),
      () => void pending.setStatus(id, 'PENDING'),
    );

  const decline = (id: string) =>
    runUndoable(
      t('commission.admin.triage.declinedToast'),
      () => void pending.setStatus(id, 'DECLINED'),
      () => void pending.setStatus(id, 'PENDING'),
    );

  const restore = (id: string) => void declined.setStatus(id, 'PENDING');

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">
        {t('commission.admin.triage.title')}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex gap-1">
          {TRIAGE_TABS.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={tab === status ? 'default' : 'ghost'}
              onClick={() => setTab(status)}
            >
              {t(`commission.status.${status}`)}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as CommissionsSort)}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRIAGE_SORT_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(`commission.admin.triage.sort.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {tab === 'PENDING' && (
            <div className="flex overflow-hidden rounded-md border border-border">
              {TRIAGE_VIEW_MODES.map((mode) => (
                <Button
                  key={mode}
                  size="icon"
                  variant={view === mode ? 'default' : 'ghost'}
                  className="rounded-none"
                  aria-label={t(`commission.admin.triage.view.${mode}`)}
                  onClick={() => setView(mode)}
                >
                  {mode === 'card' ? <LayoutGrid /> : <List />}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {pendingUndo && (
        <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-sm">
          <span>{pendingUndo.message}</span>
          <Button size="sm" variant="ghost" onClick={confirmUndo}>
            {t('commission.admin.triage.undo')}
          </Button>
        </div>
      )}

      {active.isLoading ? (
        <p className="text-muted-foreground">{t('common:loading')}</p>
      ) : tab === 'PENDING' ? (
        view === 'card' ? (
          pending.items.length === 0 ? (
            <p className="text-muted-foreground">
              {t('commission.admin.triage.empty')}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pending.items.map((item) => (
                <TriageCard
                  key={item.id}
                  commission={item}
                  onAccept={() => accept(item.id)}
                  onDecline={() => decline(item.id)}
                />
              ))}
            </div>
          )
        ) : (
          <TriageTable
            items={pending.items}
            onAccept={accept}
            onDecline={decline}
          />
        )
      ) : tab === 'ACCEPTED' ? (
        <AcceptedSlotsTable
          items={accepted.items}
          candidates={[...pending.items, ...declined.items]}
          onSaveQuote={(id, quote) => void accepted.setQuote(id, quote)}
          onSavePaymentStatus={(id, status) =>
            void accepted.setPaymentStatus(id, status)
          }
          onConfirm={(id) => void accepted.setStatus(id, 'NOT_YET_STARTED')}
          onReplace={(outgoingId, incomingId) => {
            void accepted.setStatus(outgoingId, 'DECLINED');
            void accepted.setStatus(incomingId, 'ACCEPTED');
          }}
          onSendConfirmation={(id) => {
            const item = accepted.items.find((row) => row.id === id);
            if (!item) return;
            const quoteChanged =
              item.originalQuote != null && item.quote !== item.originalQuote;
            if (quoteChanged) {
              setConfirmingId(id);
            } else {
              void accepted.sendConfirmation(id);
            }
          }}
          onDelete={(id) => void accepted.remove(id)}
        />
      ) : (
        <DeclinedList items={declined.items} onRestore={restore} />
      )}

      <ConfirmationNoteDialog
        open={confirmingId !== null}
        onOpenChange={(open) => !open && setConfirmingId(null)}
        onSubmit={(note) => {
          if (confirmingId) void accepted.sendConfirmation(confirmingId, note);
        }}
      />
    </div>
  );
}
