import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { Check } from 'lucide-react';
import { CHIP_BASE, CHIP_IDLE, CHIP_SELECTED } from '../../constants/chips';
import { useFoodCategoryNames } from '../../hooks/useFoodCategoryNames';
import FilterChipsSkeleton from './FilterChipsSkeleton';

interface Props {
  selected: readonly string[];
  onToggle: (category: string) => void;
}

function FoodCategoryBar({ selected, onToggle }: Props) {
  const { t } = useTranslation();
  const foodCategories = useFoodCategoryNames();

  if (foodCategories.isLoading) {
    return <FilterChipsSkeleton />;
  }
  if (foodCategories.names.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={t('filters.foodCategories')}
      className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0"
    >
      {foodCategories.names.map((name) => {
        const isOn = selected.includes(name);
        return (
          <button
            key={name}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(name)}
            className={cn(CHIP_BASE, isOn ? CHIP_SELECTED : CHIP_IDLE)}
          >
            {isOn && <Check className="size-3.5 shrink-0" aria-hidden />}
            <span>{name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default FoodCategoryBar;
