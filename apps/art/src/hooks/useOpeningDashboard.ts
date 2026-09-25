'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { CommissionOpeningDto } from '@hatohui/models';
import { OPENING_DASHBOARD_TABS } from '@/constants/commission';
import { useCommissionFormatters } from './useCommissionFormatters';
import { useTabParam } from './useTabParam';

export function useOpeningDashboard(
  active: CommissionOpeningDto,
  onOpenNow: () => Promise<unknown>,
  onClose: () => Promise<unknown>,
) {
  const { t } = useTranslation('art');
  const formatters = useCommissionFormatters();
  const { tab, setTab } = useTabParam(OPENING_DASHBOARD_TABS, 'overview');
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setIsBusy(true);
    try {
      await action();
    } finally {
      setIsBusy(false);
    }
  };

  const supportingLine =
    active.status === 'SCHEDULED' && active.scheduledAt
      ? t('commission.admin.opening.scheduledFor', {
          date: formatters.dateTime(active.scheduledAt),
        })
      : active.status === 'OPEN' && active.openedAt
        ? t('commission.admin.opening.openSince', {
            date: formatters.date(active.openedAt),
          })
        : null;

  return {
    tab,
    setTab,
    supportingLine,
    isBusy,
    isConfirmingClose,
    canOpenNow: active.status === 'SCHEDULED',
    canClose: active.status === 'OPEN',
    openNow: () => void run(onOpenNow),
    requestClose: () => setIsConfirmingClose(true),
    cancelClose: () => setIsConfirmingClose(false),
    confirmClose: () => {
      setIsConfirmingClose(false);
      void run(onClose);
    },
  };
}
