'use client';

import { useTranslation } from '@hatohui/i18n';
import { useCommission } from '@hatohui/models';
import { EMPTY_VALUE } from '@/constants/commission';
import { useCommissionFormatters } from './useCommissionFormatters';
import { useCommissionRequestActions } from './useCommissionRequestActions';

export function useCommissionRequestPanel(id: string | null) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();
  const actions = useCommissionRequestActions();
  const query = useCommission(id ?? '', { query: { enabled: id !== null } });
  const commission = query.data?.data;

  if (!id || !commission) {
    return { isLoading: id !== null && query.isPending, request: null };
  }

  const contact = t(
    `commission.preferredContactMethod.${commission.preferredContactMethod}`,
  );

  return {
    isLoading: false,
    request: {
      id: commission.id,
      title: format.type(
        commission.commissionTypeKey,
        commission.commissionTypeLabel,
      ),
      clientName: commission.clientName,
      clientEmail: commission.clientEmail,
      status: commission.status,
      isPending: commission.status === 'PENDING',
      idea: commission.idea,
      references: commission.referenceAssets,
      facts: [
        { key: 'submitted', value: format.date(commission.createdAt) },
        { key: 'deadline', value: format.date(commission.deadline) },
        {
          key: 'quote',
          value: format.money(commission.quote, commission.currency),
        },
        {
          key: 'payment',
          value: t(`commission.paymentStatus.${commission.paymentStatus}`),
        },
        {
          key: 'contact',
          value: commission.contactHandle
            ? `${contact} - ${commission.contactHandle}`
            : contact || EMPTY_VALUE,
        },
      ],
      fullPageHref: `/app/commissions/${commission.id}`,
    },
    accept: () => actions.accept(commission.id),
    decline: () => actions.decline(commission.id),
    setStatus: (status: typeof commission.status) =>
      actions.setStatus(commission.id, status),
  };
}
