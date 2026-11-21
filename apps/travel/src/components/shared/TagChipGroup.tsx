import { Check } from 'lucide-react';
import { cn } from '@hatohui/ui';

interface Props<T extends string> {
  label: string;
  options: readonly T[];
  selected: readonly T[];
  labelOf: (value: T) => string;
  onToggle: (value: T) => void;
  tone?: 'default' | 'warning';
}

function TagChipGroup<T extends string>({
  label,
  options,
  selected,
  labelOf,
  onToggle,
  tone = 'default',
}: Props<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const isOn = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(option)}
            className={cn(
              'inline-flex h-9 cursor-pointer items-center gap-1 rounded-full border px-3 text-sm transition-colors duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none sm:h-8',
              !isOn &&
                'border-border text-muted-foreground hover:text-foreground',
              isOn &&
                tone === 'default' &&
                'border-primary bg-primary/10 text-foreground',
              isOn &&
                tone === 'warning' &&
                'border-amber-500/60 bg-amber-500/10 text-amber-800 dark:text-amber-300',
            )}
          >
            {isOn && <Check className="size-3.5" aria-hidden />}
            {labelOf(option)}
          </button>
        );
      })}
    </div>
  );
}

export default TagChipGroup;
