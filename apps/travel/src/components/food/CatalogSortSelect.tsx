import { useTranslation } from '@hatohui/i18n';
import type { TravelCatalogSort } from '@hatohui/models';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  cn,
} from '@hatohui/ui';
import { ArrowUpDown } from 'lucide-react';
import { FIELD_OUTLINE } from '../../constants/chips';
import {
  CATALOG_SORT_OPTIONS,
  type CatalogSortView,
} from '../../constants/food';

interface Props {
  view: CatalogSortView;
  value: TravelCatalogSort;
  onChange: (sort: TravelCatalogSort) => void;
}

function CatalogSortSelect({ view, value, onChange }: Props) {
  const { t } = useTranslation();
  const options = CATALOG_SORT_OPTIONS[view];
  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <Select
      value={current.value}
      onValueChange={(next) => {
        const match = options.find((o) => o.value === next);
        if (match) onChange(match.value);
      }}
    >
      <SelectTrigger
        aria-label={t('catalog.sort.label')}
        className={cn(
          'h-9 w-auto gap-1.5 rounded-full bg-transparent px-3 text-xs shadow-none sm:h-8 md:text-xs dark:bg-transparent',
          FIELD_OUTLINE,
        )}
      >
        <ArrowUpDown className="size-3.5 text-muted-foreground" aria-hidden />
        <span className="text-muted-foreground">{t('catalog.sort.label')}</span>
        <span className="font-medium text-foreground">
          {t(current.labelKey)}
        </span>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-52 rounded-xl p-1 shadow-lg">
        <SelectGroup>
          {options.map(({ value: option, labelKey, icon: Icon }) => (
            <SelectItem
              key={option}
              value={option}
              className="rounded-lg [&>span:last-child]:flex [&>span:last-child]:items-center [&>span:last-child]:gap-2.5 py-2 pl-2.5 data-[state=checked]:bg-primary/12 data-[state=checked]:font-medium data-[state=checked]:text-[#8f4429] dark:data-[state=checked]:bg-primary/20 dark:data-[state=checked]:text-[#e9a487]"
            >
              <Icon className="size-4 opacity-80" aria-hidden />
              {t(labelKey)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default CatalogSortSelect;
