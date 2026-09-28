'use client';

import { Check } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { CommissionQueuePlacementDto } from '@hatohui/models';
import { cn } from '@hatohui/ui';
import { QUEUE_STAGE_ORDER } from '@/constants/queue';

export function OrderStageTracker({
  placement,
}: {
  placement: CommissionQueuePlacementDto;
}) {
  const { t } = useTranslation('art');

  return (
    <ol className="grid grid-cols-4 gap-2 rounded-xl border border-border bg-card p-4">
      {QUEUE_STAGE_ORDER.map((stage, index) => {
        const isDone = index < placement.stageIndex;
        const isCurrent = index === placement.stageIndex;
        return (
          <li
            key={stage}
            aria-current={isCurrent ? 'step' : undefined}
            className="flex flex-col items-center gap-2 text-center"
          >
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full border text-xs font-medium',
                isDone && 'border-primary bg-primary text-primary-foreground',
                isCurrent &&
                  'border-primary text-primary ring-4 ring-primary/15',
                !isDone && !isCurrent && 'border-border text-muted-foreground',
              )}
            >
              {isDone ? <Check className="size-3.5" aria-hidden /> : index + 1}
            </span>
            <span
              className={cn(
                'text-xs sm:text-sm',
                isCurrent ? 'font-medium' : 'text-muted-foreground',
              )}
            >
              {t(`queue.stage.${stage}`)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
