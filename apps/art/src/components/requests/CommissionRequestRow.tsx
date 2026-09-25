'use client';

import type { CommissionRequestRow as Row } from '@/hooks/useCommissionRequests';
import { CommissionStatusBadge } from './CommissionStatusBadge';
import { CommissionRequestRowActions } from './CommissionRequestRowActions';

export function CommissionRequestRow({
  row,
  onOpen,
  onAccept,
  onDecline,
}: {
  row: Row;
  onOpen: () => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <tr
      className="cursor-pointer border-t border-border transition-colors hover:bg-muted/40"
      onClick={onOpen}
    >
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground tabular-nums">
        {row.submitted}
      </td>
      <td className="px-4 py-3">
        <div className="font-medium">{row.clientName}</div>
        <div className="text-xs text-muted-foreground">{row.clientEmail}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">{row.type}</td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground tabular-nums">
        {row.deadline}
      </td>
      <td className="px-4 py-3 whitespace-nowrap tabular-nums">{row.quote}</td>
      <td className="px-4 py-3">
        <CommissionStatusBadge status={row.status} />
      </td>
      <td className="px-4 py-3">
        {row.status === 'PENDING' && (
          <CommissionRequestRowActions
            onAccept={onAccept}
            onDecline={onDecline}
          />
        )}
      </td>
    </tr>
  );
}
