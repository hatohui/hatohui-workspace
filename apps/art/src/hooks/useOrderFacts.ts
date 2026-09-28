'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionPublicDetailDto } from '@hatohui/models';
import { useCommissionFormatters } from './useCommissionFormatters';

export interface OrderFact {
  label: string;
  value: string;
}

export function useOrderFacts(commission: CommissionPublicDetailDto) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();
  const facts: OrderFact[] = [];

  if (commission.quote !== null) {
    facts.push(
      {
        label: t('orders.facts.price'),
        value: format.money(commission.quote, commission.currency),
      },
      {
        label: t('orders.facts.payment'),
        value: t(`commission.paymentStatus.${commission.paymentStatus}`),
      },
    );
  }
  if (commission.deadline) {
    facts.push({
      label: t('orders.facts.deadline'),
      value: format.date(commission.deadline),
    });
  }

  return facts;
}
