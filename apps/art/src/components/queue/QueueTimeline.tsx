'use client';

import { useTranslation } from '@hatohui/i18n';
import { useCommissionQueue } from '@/hooks/useCommissionQueue';
import { useStaggerReveal } from '@/hooks/useStaggerReveal';
import { QueueTimelineItem } from './QueueTimelineItem';

export function QueueTimeline({ artistId }: { artistId: string }) {
  const { t } = useTranslation('art');
  const { items, isLoading } = useCommissionQueue(artistId);
  const listRef = useStaggerReveal<HTMLOListElement>('[data-reveal]', [items]);

  if (isLoading)
    return <p className="text-muted-foreground">{t('common:loading')}</p>;
  if (items.length === 0)
    return <p className="text-muted-foreground">{t('queue.empty')}</p>;

  return (
    <ol ref={listRef} className="space-y-2">
      {items.map((item) => (
        <li key={item.id} data-reveal>
          <QueueTimelineItem item={item} />
        </li>
      ))}
    </ol>
  );
}
