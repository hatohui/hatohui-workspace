'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionRequestRow as Row } from '@/hooks/useCommissionRequests';
import { useCommissionRequestActions } from '@/hooks/useCommissionRequestActions';
import type { CommissionTableColumn } from '@/constants/commission';
import { CommissionRequestRow } from './CommissionRequestRow';

export function CommissionRequestsTable({
  rows,
  columns,
  onOpen,
  onOpenClient,
}: {
  rows: Row[];
  columns: readonly CommissionTableColumn[];
  onOpen: (id: string) => void;
  onOpenClient: (clientId: string) => void;
}) {
  const { t } = useTranslation('art');
  const actions = useCommissionRequestActions();

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-2.5 text-left font-medium whitespace-nowrap"
              >
                {column === 'actions' ? (
                  <span className="sr-only">
                    {t('app.requests.columns.actions')}
                  </span>
                ) : (
                  t(`app.requests.columns.${column}`)
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <CommissionRequestRow
              key={row.id}
              row={row}
              columns={columns}
              onOpen={() => onOpen(row.id)}
              onOpenClient={() => onOpenClient(row.clientId)}
              onAccept={() => actions.accept(row.id)}
              onDecline={() => actions.decline(row.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
