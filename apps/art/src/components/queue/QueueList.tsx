'use client';

import { Inbox } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { CommissionQueueItemDto } from '@hatohui/models';
import { Skeleton } from '@hatohui/ui';
import { useCommissionQueue } from '@/hooks/useCommissionQueue';
import { useStaggerReveal } from '@/hooks/useStaggerReveal';
import { QueueRow } from './QueueRow';

const SKELETON_ROWS = 3;

export function QueueList({
  artistId,
  onSelect,
}: {
  artistId: string;
  onSelect: (item: CommissionQueueItemDto) => void;
}) {
  const { t } = useTranslation('art');
  const { items, revealKey, isLoading } = useCommissionQueue(artistId);
  const listRef = useStaggerReveal<HTMLOListElement>('[data-reveal]', [
    revealKey,
  ]);

  if (isLoading)
    return (
      <div className="space-y-2">
        {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
          <Skeleton key={index} className="h-18 rounded-xl" />
        ))}
      </div>
    );

  if (items.length === 0)
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
        <Inbox className="size-6" aria-hidden />
        <p>{t('queue.empty')}</p>
      </div>
    );

  return (
    <section className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('queue.hint', { count: items.length })}
      </p>
      <ol
        ref={listRef}
        className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
      >
        {items.map((item) => (
          <li key={item.id} data-reveal>
            <QueueRow item={item} onSelect={() => onSelect(item)} />
          </li>
        ))}
      </ol>
    </section>
  );
}
