'use client';

import { Inbox } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { CommissionQueueItemDto } from '@hatohui/models';
import { Skeleton } from '@hatohui/ui';
import { useCommissionQueue } from '@/hooks/useCommissionQueue';
import { useStaggerReveal } from '@/hooks/useStaggerReveal';
import { QueueStageSection } from './QueueStageSection';

const SKELETON_ROWS = 3;

export function QueueList({
  artistId,
  onSelect,
}: {
  artistId: string;
  onSelect: (item: CommissionQueueItemDto) => void;
}) {
  const { t } = useTranslation('art');
  const { items, groups, revealKey, isLoading } = useCommissionQueue(artistId);
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
    <section className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {t('queue.hint', { count: items.length })}
      </p>
      <ol ref={listRef} className="flex flex-col gap-6">
        {groups.map((group) => (
          <QueueStageSection
            key={group.key}
            group={group}
            onSelect={onSelect}
          />
        ))}
      </ol>
    </section>
  );
}
