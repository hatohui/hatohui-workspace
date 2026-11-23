import { useTranslation } from '@hatohui/i18n';
import { Button, cn } from '@hatohui/ui';
import { UtensilsCrossed, X } from 'lucide-react';
import { useDishSearch } from '../../hooks/useDishSearch';
import {
  type DishLine,
  pickedDishOf,
} from '../../hooks/useRecommendationFields';
import { toDishSummary } from '../../lib/dishSummary';
import DishLineAllergens from './DishLineAllergens';
import DishLineNewFields from './DishLineNewFields';
import MatchedField from './MatchedField';

interface Props {
  line: DishLine;
  index: number;
  total: number;
  onChange: (patch: Partial<DishLine>) => void;
  onRemove: () => void;
}

function DishLineRow({ line, index, total, onChange, onRemove }: Props) {
  const { t } = useTranslation();
  const search = useDishSearch(line.name);
  const isMatched = Boolean(pickedDishOf(line) ?? search.match);
  const isNew = line.name.trim() !== '' && !isMatched && !search.isSearching;

  return (
    <div
      className={cn('space-y-3', index > 0 && 'border-t border-border/50 pt-4')}
    >
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <MatchedField
            id={`dish-${line.key}`}
            label={
              total > 1
                ? t('form.dishNumber', { number: index + 1 })
                : t('form.dish')
            }
            hint={index === 0 ? t('form.dishHint') : undefined}
            placeholder={t('form.dishPlaceholder')}
            value={line.name}
            options={search.suggestions}
            fallbackIcon={UtensilsCrossed}
            isMatched={isMatched}
            isSearching={search.isSearching}
            disabled={false}
            required={index === 0}
            onChange={(name) => onChange({ name })}
            onSelect={(item) => {
              const dish = search.findById(item.id);
              onChange({
                name: item.label,
                picked: dish ? toDishSummary(dish) : null,
              });
            }}
          />
        </div>
        {total > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('form.removeDish', { dish: line.name || index + 1 })}
            onClick={onRemove}
            className={cn(index === 0 && 'mb-5')}
          >
            <X />
          </Button>
        )}
      </div>
      <DishLineAllergens line={line} onChange={onChange} />
      {isNew && <DishLineNewFields line={line} onChange={onChange} />}
    </div>
  );
}

export default DishLineRow;
