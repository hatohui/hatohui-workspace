import { Check, type LucideIcon } from 'lucide-react';
import { cn } from '@hatohui/ui';
import {
  CHIP_BASE,
  CHIP_IDLE,
  CHIP_SELECTED,
  CHIP_SELECTED_WARNING,
} from '../../constants/chips';
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
        const icon = iconOf?.(option);
        const text = labelOf(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(option)}
            title={text}
            className={cn(
              CHIP_BASE,
              !isOn && CHIP_IDLE,
              isOn && tone === 'default' && CHIP_SELECTED,
              isOn && tone === 'warning' && CHIP_SELECTED_WARNING,
            )}
          >
            <TagChipIcon icon={icon && isOn ? Check : icon} />
            <span className="truncate">{text}</span>
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
