import { useTranslation } from '@hatohui/i18n';
import { LayoutGrid, X } from 'lucide-react';
import { useFoodCategoryNames } from '../../hooks/useFoodCategoryNames';
import CategoryPill from './CategoryPill';
import CategoryBarSkeleton from './CategoryBarSkeleton';

interface Props {
  selected: readonly string[];
  onToggle: (category: string) => void;
  onClear: () => void;
}

function FoodCategoryBar({ selected, onToggle, onClear }: Props) {
  const { t } = useTranslation();
  const foodCategories = useFoodCategoryNames();

  if (foodCategories.isLoading) {
    return <CategoryBarSkeleton />;
  }
  if (foodCategories.names.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={t('filters.foodCategories')}
      className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0"
    >
      <CategoryPill selected={selected.length === 0} onClick={onClear}>
        <LayoutGrid className="size-4 shrink-0" aria-hidden />
        <span>{t('filters.allCategories')}</span>
      </CategoryPill>
      <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-border" />
      {foodCategories.names.map((name) => {
        const isOn = selected.includes(name);
        return (
          <CategoryPill
            key={name}
            selected={isOn}
            onClick={() => onToggle(name)}
            label={isOn ? t('filters.removeCategory', { name }) : undefined}
          >
            <span>{name}</span>
            {isOn && <X className="-mr-1 size-3.5 shrink-0" aria-hidden />}
          </CategoryPill>
        );
      })}
    </div>
  );
}

export default FoodCategoryBar;
