'use client';

import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@hatohui/ui';
import { useTapTooltip } from '@/hooks/useTapTooltip';

export function InfoTooltip({ content }: { content: string }) {
  const tooltip = useTapTooltip();

  return (
    <Tooltip open={tooltip.open} onOpenChange={tooltip.onOpenChange}>
      <TooltipTrigger
        type="button"
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full"
        {...tooltip.triggerProps}
      >
        <Info className="size-4 text-muted-foreground" aria-hidden />
        <span className="sr-only">{content}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 whitespace-pre-line text-pretty">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
