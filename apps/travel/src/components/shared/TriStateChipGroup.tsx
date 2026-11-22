import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { Ban, type LucideIcon } from 'lucide-react';
import {
  CHIP_BASE,
  CHIP_EXCLUDED,
  CHIP_IDLE,
  CHIP_SELECTED,
} from '../../constants/chips';
import { useChipOverflow } from '../../hooks/useChipOverflow';
import MoreChip from './MoreChip';

interface Props<T extends string> {
  label: string;
  options: readonly T[];
  included: readonly T[];
  excluded: readonly T[];
  labelOf: (value: T) => string;
  iconOf?: (value: T) => LucideIcon | undefined;
  fallbackIcon: LucideIcon;
  onCycle: (value: T) => void;
  limit?: number;
}

function TriStateChipGroup<T extends string>({
  label,
  options,
  included,
  excluded,
  labelOf,
  iconOf,
  fallbackIcon,
  onCycle,
  limit,
}: Props<T>) {
  const { t } = useTranslation();
  const overflow = useChipOverflow(options, [...included, ...excluded], limit);

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1">
      {overflow.visible.map((option) => {
        const isIncluded = included.includes(option);
        const isExcluded = excluded.includes(option);
        const text = labelOf(option);
        const Icon = isExcluded ? Ban : (iconOf?.(option) ?? fallbackIcon);
        const tooltip = isIncluded
          ? t('filters.stateIncluded', { label: text })
          : isExcluded
            ? t('filters.stateExcluded', { label: text })
            : text;

        return (
          <button
            key={option}
            type="button"
            aria-pressed={isExcluded ? 'mixed' : isIncluded}
            aria-label={tooltip}
            title={tooltip}
            onClick={() => onCycle(option)}
            className={cn(
              CHIP_BASE,
              isIncluded
                ? CHIP_SELECTED
                : isExcluded
                  ? CHIP_EXCLUDED
                  : CHIP_IDLE,
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden />
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

export default TriStateChipGroup;
