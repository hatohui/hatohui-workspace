'use client';

import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';

export function QueueStageMeter({
  stageIndex,
  stageCount,
  className,
}: {
  stageIndex: number;
  stageCount: number;
  className?: string;
}) {
  const { t } = useTranslation('art');

  return (
    <span
      role="img"
      aria-label={t('queue.stageProgress', {
        current: stageIndex + 1,
        total: stageCount,
      })}
      className={cn('shrink-0 items-center gap-1', className)}
    >
      {Array.from({ length: stageCount }).map((_, index) => (
        <span
          key={index}
          className={cn(
            'h-1.5 w-4 rounded-full',
            index <= stageIndex ? 'bg-primary' : 'bg-border',
          )}
        />
      ))}
    </span>
  );
}
