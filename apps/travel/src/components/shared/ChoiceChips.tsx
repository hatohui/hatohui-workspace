import type { ReactNode } from 'react';
import { cn } from '@hatohui/ui';
import { SWITCH_ACTIVE } from '../../constants/chips';

export interface ChoiceOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface Props<T extends string> {
  label: string;
  options: ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
}

function ChoiceChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex flex-wrap gap-0.5 rounded-full border border-foreground/45 p-0.5 dark:border-foreground/35"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex h-8 cursor-pointer items-center gap-1 rounded-full px-2.5 text-xs transition-colors duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none sm:h-7',
            value === option.value
              ? SWITCH_ACTIVE
              : 'text-foreground/80 hover:bg-foreground/10 hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default ChoiceChips;
