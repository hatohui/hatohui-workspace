'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  useCommissions,
  type UpsertCommissionOpeningDto,
} from '@hatohui/models';
import { useCommissionOpeningsAdmin } from './useCommissionOpenings';
import { useCommissionFormatters } from './useCommissionFormatters';

export function useOpeningBar() {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();
  const openings = useCommissionOpeningsAdmin();
  const waitingQuery = useCommissions({ view: 'requests', pageSize: 1 });
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const { active } = openings;
  const waiting = waitingQuery.data?.data.total ?? 0;
  const taken = active?.slotsTaken ?? 0;

  const run = async (action: () => Promise<unknown>) => {
    setIsBusy(true);
    try {
      await action();
    } finally {
      setIsBusy(false);
    }
  };

  const headline = !active
    ? t('app.commissions.opening.closed')
    : active.status === 'OPEN'
      ? t('app.commissions.opening.open')
      : t('app.commissions.opening.scheduled', {
          date: format.dateTime(active.scheduledAt),
        });

  const slots = !active
    ? null
    : active.slotCap
      ? t('app.commissions.opening.slotsOfCap', {
          taken,
          cap: active.slotCap,
        })
      : t('app.commissions.opening.slotsTaken', { count: taken });

  return {
    isLoading: openings.isLoading,
    active,
    history: openings.history,
    historyItem: openings.items.find((item) => item.id === historyId),
    status: active?.status ?? 'CLOSED',
    headline,
    slots,
    waiting:
      waiting > 0
        ? t('app.commissions.opening.waiting', { count: waiting })
        : null,
    isBusy,
    canOpenNow: active?.status === 'SCHEDULED',
    canClose: active?.status === 'OPEN',
    openNow: () => active && void run(() => openings.open(active.id)),
    isConfirmingClose,
    requestClose: () => setIsConfirmingClose(true),
    cancelClose: () => setIsConfirmingClose(false),
    confirmClose: () => {
      setIsConfirmingClose(false);
      if (active) void run(() => openings.close(active.id));
    },
    isOptionsOpen,
    setIsOptionsOpen,
    selectHistory: setHistoryId,
    save: (dto: UpsertCommissionOpeningDto) =>
      active
        ? openings.update({ id: active.id, data: dto })
        : openings.create({ data: dto }),
  };
}
