'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionQueueItemDto } from '@hatohui/models';
import type { QueueStageGroup } from '@/hooks/useCommissionQueue';
import { QueueRow } from './QueueRow';

export function QueueStageSection({
  group,
  onSelect,
}: {
  group: QueueStageGroup;
  onSelect: (item: CommissionQueueItemDto) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <li>
      <div className="mb-3 flex items-center gap-2">
        <span className="size-2 shrink-0 rounded-full bg-primary" />
        <h2 className="font-serif text-xl">
          {t(`queue.stage.${group.stage}`)}
        </h2>
      </div>
      <ol className="ml-0.75 flex flex-col gap-3 border-l border-border py-1 pl-5">
        {group.items.map((item) => (
          <li key={item.id} data-reveal>
            <QueueRow item={item} onSelect={() => onSelect(item)} />
          </li>
        ))}
      </ol>
    </li>
  );
}
