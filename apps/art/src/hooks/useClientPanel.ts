'use client';

import { useTranslation } from '@hatohui/i18n';
import { useClient } from '@hatohui/models';
import { useCommissionFormatters } from './useCommissionFormatters';

export function useClientPanel(clientId: string | null) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();
  const query = useClient(clientId ?? '', {
    query: { enabled: clientId !== null },
  });
  const client = query.data?.data;

  if (!clientId || !client) return { client: null };

  const method = t(
    `commission.preferredContactMethod.${client.preferredContactMethod}`,
  );

  return {
    client: {
      name: client.name,
      email: client.email,
      contact: client.contactHandle
        ? `${method} · ${client.contactHandle}`
        : method,
      account: client.account && {
        name: client.account.name,
        avatarUrl: client.account.avatarUrl,
        handle: client.account.handle,
        profileHref: client.account.handle ? `/${client.account.handle}` : null,
      },
      commissions: client.commissions.map((commission) => ({
        id: commission.id,
        href: `/app/commissions/${commission.id}`,
        type: format.type(
          commission.commissionTypeKey,
          commission.commissionTypeLabel,
        ),
        submitted: format.date(commission.createdAt),
        price: format.money(commission.quote, commission.currency),
        status: commission.status,
      })),
    },
  };
}
