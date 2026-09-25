'use client';

import { cn } from '@hatohui/ui';

export function DashboardDeadlineItem({
  item,
  onOpen,
}: {
  item: {
    clientName: string;
    type: string;
    day: string;
    month: string;
    dueLabel: string;
    urgent: boolean;
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
        <span
          className={cn(
            'flex size-11 shrink-0 flex-col items-center justify-center rounded-lg leading-none',
            item.urgent ? 'bg-primary/10 text-primary' : 'bg-card',
          )}
        >
          <span className="font-serif text-lg">{item.day}</span>
          <span className="text-[10px] tracking-wide uppercase">
            {item.month}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{item.clientName}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {item.type} ·{' '}
            <span className={cn(item.urgent && 'font-medium text-primary')}>
              {item.dueLabel}
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}
