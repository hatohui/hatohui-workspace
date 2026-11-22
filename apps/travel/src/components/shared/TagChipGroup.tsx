import { Check, type LucideIcon } from 'lucide-react';
import { cn } from '@hatohui/ui';
import { useChipOverflow } from '../../hooks/useChipOverflow';
import MoreChip from './MoreChip';
import TagChipIcon from './TagChipIcon';

interface Props<T extends string> {
  label: string;
  options: readonly T[];
  selected: readonly T[];
  labelOf: (value: T) => string;
  iconOf?: (value: T) => LucideIcon | undefined;
  onToggle: (value: T) => void;
  tone?: 'default' | 'warning';
  limit?: number;
}

function TagChipGroup<T extends string>({
  label,
  options,
  selected,
  labelOf,
  iconOf,
  onToggle,
  tone = 'default',
  limit,
}: Props<T>) {
  const overflow = useChipOverflow(options, selected, limit);
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1">
      {overflow.visible.map((option) => {
        const isOn = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(option)}
            className={cn(
              'inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border px-2.5 text-xs transition-colors duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none sm:h-7',
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
            <TagChipIcon icon={isOn ? Check : iconOf?.(option)} />
            {labelOf(option)}
          </button>
        );
      })}
      {overflow.canCollapse && (
        <MoreChip
          expanded={overflow.expanded}
          hiddenCount={overflow.hiddenCount}
          onToggle={overflow.toggle}
        />
      )}
    </div>
  );
}

export default TagChipGroup;
