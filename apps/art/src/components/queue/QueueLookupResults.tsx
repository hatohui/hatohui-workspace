'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { useCommissionAccessLookup } from '@/hooks/useCommissionAccessLookup';
import { useCommissionFormatters } from '@/hooks/useCommissionFormatters';

export function QueueLookupResults({
  lookup,
}: {
  lookup: ReturnType<typeof useCommissionAccessLookup>;
}) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();

  if (lookup.matches.length < 2) return null;

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {lookup.matches.map((match) => (
        <li key={match.accessCode}>
          <Link
            href={lookup.orderHref(match.accessCode)}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-card-hover"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">
                {format.type(
                  match.commissionTypeKey,
                  match.commissionTypeLabel,
                )}
              </span>
              <span className="block text-sm text-muted-foreground">
                {t(`commission.status.${match.status}`)}
                <span aria-hidden> · </span>
                {format.date(match.createdAt)}
              </span>
            </span>
            <ChevronRight
              className="size-4 text-muted-foreground"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
