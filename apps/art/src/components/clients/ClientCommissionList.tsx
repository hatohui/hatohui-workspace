'use client';

import Link from 'next/link';
import { useTranslation } from '@hatohui/i18n';
import type { CommissionDto } from '@hatohui/models';
import { CommissionStatusBadge } from '@/components/requests/CommissionStatusBadge';

interface ClientCommission {
  id: string;
  href: string;
  type: string;
  submitted: string;
  price: string;
  status: CommissionDto['status'];
}

export function ClientCommissionList({
  commissions,
}: {
  commissions: ClientCommission[];
}) {
  const { t } = useTranslation('art');

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium">
        {t('app.clients.history', { count: commissions.length })}
      </h3>
      <ul className="divide-y divide-border rounded-md border border-border">
        {commissions.map((commission) => (
          <li key={commission.id}>
            <Link
              href={commission.href}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors hover:bg-muted/40"
            >
              <span className="min-w-0">
                <span className="block font-medium">{commission.type}</span>
                <span className="block text-xs text-muted-foreground tabular-nums">
                  {commission.submitted} · {commission.price}
                </span>
              </span>
              <CommissionStatusBadge status={commission.status} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
