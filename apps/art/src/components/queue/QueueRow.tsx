'use client';

import { ChevronRight, Lock } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { CommissionQueueItemDto } from '@hatohui/models';
import { cn } from '@hatohui/ui';
import { useCommissionFormatters } from '@/hooks/useCommissionFormatters';
import { QueueStageMeter } from './QueueStageMeter';

export function QueueRow({
  item,
  onSelect,
}: {
  item: CommissionQueueItemDto;
  onSelect: () => void;
}) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 text-left text-card-foreground transition-[background-color,box-shadow] duration-200 ease-out hover:bg-card-hover hover:shadow-soft focus-visible:bg-card-hover focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none sm:px-5"
    >
      <span className="w-8 shrink-0 text-center font-serif text-2xl tabular-nums text-muted-foreground">
        {item.position}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">
          {format.type(item.commissionTypeKey, item.commissionTypeLabel)}
        </span>
        <span className="block text-sm text-muted-foreground">
          {t('queue.since', { date: format.date(item.queuedAt) })}
        </span>
      </span>
      <QueueStageMeter
        stageIndex={item.stageIndex}
        stageCount={item.stageCount}
        className="hidden sm:flex"
      />
      <Lock
        className={cn(
          'size-4 shrink-0 text-muted-foreground',
          !item.isUnlockable && 'invisible',
        )}
        aria-label={item.isUnlockable ? t('queue.locked') : undefined}
        aria-hidden={!item.isUnlockable}
      />
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </button>
  );
}
