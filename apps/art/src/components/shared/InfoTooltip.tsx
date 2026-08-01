'use client';

import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@hatohui/ui';

export function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger type="button" className="inline-flex align-middle">
        <Info className="size-4 text-muted-foreground" aria-hidden />
        <span className="sr-only">{content}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 whitespace-pre-line text-pretty">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
