import { useTranslation } from '@hatohui/i18n';
import type { TravelCatalogSort } from '@hatohui/models';
import { cn } from '@hatohui/ui';
import { ArrowUpDown } from 'lucide-react';
import { FIELD_OUTLINE } from '../../constants/chips';
import { CATALOG_SORT_OPTIONS, type FoodView } from '../../constants/food';

interface Props {
  view: FoodView;
  value: TravelCatalogSort;
  onChange: (sort: TravelCatalogSort) => void;
}

function CatalogSortSelect({ view, value, onChange }: Props) {
  const { t } = useTranslation();
  const options = CATALOG_SORT_OPTIONS[view];

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t('catalog.sort.label')}</span>
      <ArrowUpDown
        className="pointer-events-none absolute left-2.5 size-3.5 text-foreground/70"
        aria-hidden
      />
      <select
        value={value}
        onChange={(e) => {
          const next = options.find((o) => o.value === e.target.value);
          if (next) onChange(next.value);
        }}
        className={cn(
          'h-9 cursor-pointer rounded-full border bg-background pr-3 pl-8 text-xs text-foreground/85 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:h-8',
          FIELD_OUTLINE,
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}

export default CatalogSortSelect;
