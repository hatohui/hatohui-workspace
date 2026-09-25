'use client';

import type { CommissionDto } from '@hatohui/models';
import { CommissionStatusBadge } from '@/components/requests/CommissionStatusBadge';

export function DashboardRequestItem({
  item,
  onOpen,
}: {
  item: {
    clientName: string;
    initials: string;
    type: string;
    status: CommissionDto['status'];
    submitted: string;
  };
  onOpen: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card font-serif text-base">
          {item.initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{item.clientName}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {item.type} · {item.submitted}
          </span>
        </span>
        <CommissionStatusBadge status={item.status} />
      </button>
    </li>
  );
}
