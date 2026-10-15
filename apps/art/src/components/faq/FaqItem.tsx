'use client';

import { ChevronDown } from 'lucide-react';
import { Markdown } from '@/components/shared/Markdown';

export function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group border-b border-border py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden
        />
      </summary>
      <Markdown className="mt-3 text-base leading-relaxed text-muted-foreground">
        {answer}
      </Markdown>
    </details>
  );
}
