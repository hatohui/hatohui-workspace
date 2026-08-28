'use client';

import { useTranslation } from '@hatohui/i18n';
import { ChevronRight } from 'lucide-react';
import type { CommissionOpeningDto } from '@hatohui/models';
import { OpeningStatusBadge } from './OpeningStatusBadge';

const COLUMNS = ['status', 'endMode', 'slots', 'opened', 'closed'] as const;

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : '—';
}

export function OpeningHistoryTable({
  items,
  onSelect,
}: {
  items: CommissionOpeningDto[];
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation('art');

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        {t('commission.admin.opening.noHistory')}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            {COLUMNS.map((col) => (
              <th key={col} className="px-3 py-2 text-left font-medium">
                {t(`commission.admin.opening.columns.${col}`)}
              </th>
            ))}
            <th className="w-8 px-3 py-2" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              tabIndex={0}
              role="button"
              aria-label={t('commission.admin.opening.detail.heading')}
              onClick={() => onSelect(item.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(item.id);
                }
              }}
              className="cursor-pointer border-t border-border transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
            >
              <td className="px-3 py-2.5">
                <OpeningStatusBadge status={item.status} />
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {t(`commission.admin.opening.endModeShort.${item.endMode}`)}
              </td>
              <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                {item.slotCap != null
                  ? `${item.slotsTaken} / ${item.slotCap}`
                  : item.slotsTaken}
              </td>
              <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                {formatDate(item.openedAt)}
              </td>
              <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                {formatDate(item.closedAt)}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                <ChevronRight className="size-4" aria-hidden />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
