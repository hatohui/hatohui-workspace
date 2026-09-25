'use client';

import type { CommissionRequestRow as Row } from '@/hooks/useCommissionRequests';
import type { CommissionTableColumn } from '@/constants/commission';
import { CommissionRequestCell } from './CommissionRequestCell';

export function CommissionRequestRow({
  row,
  columns,
  onOpen,
  onOpenClient,
  onAccept,
  onDecline,
}: {
  row: Row;
  columns: readonly CommissionTableColumn[];
  onOpen: () => void;
  onOpenClient: () => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <tr
      className="cursor-pointer border-t border-border transition-colors hover:bg-muted/40"
      onClick={onOpen}
    >
      {columns.map((column) => (
        <td key={column} className="px-4 py-3 align-middle">
          <CommissionRequestCell
            column={column}
            row={row}
            onOpenClient={onOpenClient}
            onAccept={onAccept}
            onDecline={onDecline}
          />
        </td>
      ))}
    </tr>
  );
}
