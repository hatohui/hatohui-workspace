'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@hatohui/ui';
import { PANEL_TONE_CLASSES, type PanelTone } from '@/constants/commission';

export function CommissionFormPanel({
  icon: Icon,
  tone,
  title,
  description,
  className,
  children,
}: {
  icon: LucideIcon;
  tone: PanelTone;
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  const toneClasses = PANEL_TONE_CLASSES[tone];

  return (
    <section
      className={cn(
        'relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('absolute inset-x-0 top-0 h-0.5', toneClasses.rule)}
      />
      <header className="flex items-center gap-4">
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full',
            toneClasses.chip,
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="font-serif text-2xl leading-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}
