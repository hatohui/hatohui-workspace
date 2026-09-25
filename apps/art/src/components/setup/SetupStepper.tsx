'use client';

import { Check } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import type { ArtistSetupStep } from '@/constants/setup';

export function SetupStepper({
  steps,
  onSelect,
}: {
  steps: { key: ArtistSetupStep; done: boolean; active: boolean }[];
  onSelect: (step: ArtistSetupStep) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.key}>
          <button
            type="button"
            aria-current={step.active ? 'step' : undefined}
            onClick={() => onSelect(step.key)}
            className={cn(
              'flex w-full cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none',
              step.active
                ? 'border-primary bg-primary/5 font-medium'
                : 'border-border hover:bg-muted',
            )}
          >
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full text-xs',
                step.done
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {step.done ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                index + 1
              )}
            </span>
            {t(`app.setup.steps.${step.key}.short`)}
          </button>
        </li>
      ))}
    </ol>
  );
}
