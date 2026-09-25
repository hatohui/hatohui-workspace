'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionRequestRow as Row } from '@/hooks/useCommissionRequests';
import type { CommissionTableColumn } from '@/constants/commission';
import { CommissionStatusBadge } from './CommissionStatusBadge';
import { CommissionRequestRowActions } from './CommissionRequestRowActions';

export function CommissionRequestCell({
  column,
  row,
  onOpenClient,
  onAccept,
  onDecline,
}: {
  column: CommissionTableColumn;
  row: Row;
  onOpenClient: () => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { t } = useTranslation('art');

  switch (column) {
    case 'submitted':
      return (
        <span className="whitespace-nowrap text-muted-foreground tabular-nums">
          {row.submitted}
        </span>
      );
    case 'client':
      return (
        <button
          type="button"
          className="cursor-pointer text-left underline-offset-4 hover:underline"
          onClick={(event) => {
            event.stopPropagation();
            onOpenClient();
          }}
        >
          <span className="block font-medium">{row.clientName}</span>
          <span className="block text-xs text-muted-foreground">
            {row.clientEmail}
          </span>
        </button>
      );
    case 'type':
      return <span className="whitespace-nowrap">{row.type}</span>;
    case 'deadline':
      return (
        <span className="whitespace-nowrap text-muted-foreground tabular-nums">
          {row.deadline}
        </span>
      );
    case 'estimate':
      return (
        <span className="flex flex-col whitespace-nowrap tabular-nums">
          {row.estimate}
          {row.isQuoted && (
            <span className="text-xs text-primary">
              {t('app.requests.quoteSent')}
            </span>
          )}
        </span>
      );
    case 'price':
      return (
        <span className="whitespace-nowrap tabular-nums">{row.price}</span>
      );
    case 'status':
      return <CommissionStatusBadge status={row.status} />;
    case 'actions':
      return row.status === 'PENDING' ? (
        <CommissionRequestRowActions
          onAccept={onAccept}
          onDecline={onDecline}
        />
      ) : null;
  }
}
