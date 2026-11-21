import { useTranslation } from '@hatohui/i18n';
import { Flame } from 'lucide-react';
import { DIET_ICONS, DIET_TAGS } from '../../constants/travel';
import type { useCatalog } from '../../hooks/useCatalog';
import SearchField from '../shared/SearchField';
import TagChipGroup from '../shared/TagChipGroup';
import AllergenFilter from './AllergenFilter';
import FilterChip from './FilterChip';

interface Props {
  filters: ReturnType<typeof useCatalog>['filters'];
}

function CatalogToolbar({ filters }: Props) {
  const { t } = useTranslation();
  return (
    <div className="sticky top-[57px] z-20 -mx-4 space-y-2 bg-background/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <SearchField
          value={filters.search}
          placeholder={t('catalog.searchPlaceholder')}
          onChange={filters.setSearch}
        />
        <AllergenFilter
          selected={filters.avoid}
          onToggle={filters.toggleAvoid}
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip
          icon={Flame}
          label={t('catalog.spicy')}
          pressed={filters.spicy}
          onChange={filters.setSpicy}
        />
        <TagChipGroup
          label={t('form.diets')}
          options={DIET_TAGS}
          selected={filters.diets}
          labelOf={(tag) => t(`diet.${tag}`)}
          iconOf={(tag) => DIET_ICONS[tag]}
          onToggle={filters.toggleDiet}
        />
      </div>
    </div>
  );
}

export default CatalogToolbar;
