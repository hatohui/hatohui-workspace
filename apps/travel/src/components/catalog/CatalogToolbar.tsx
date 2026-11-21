import { useTranslation } from '@hatohui/i18n';
import { Flame, Leaf } from 'lucide-react';
import type { useCatalog } from '../../hooks/useCatalog';
import SearchField from '../shared/SearchField';
import FilterChip from './FilterChip';

interface Props {
  filters: ReturnType<typeof useCatalog>['filters'];
}

function CatalogToolbar({ filters }: Props) {
  const { t } = useTranslation();
  return (
    <div className="sticky top-[57px] z-20 -mx-4 flex flex-wrap items-center gap-2 bg-background/90 px-4 py-3 backdrop-blur">
      <SearchField
        value={filters.search}
        placeholder={t('catalog.searchPlaceholder')}
        onChange={filters.setSearch}
      />
      <FilterChip
        icon={Flame}
        label={t('catalog.spicy')}
        pressed={filters.spicy}
        onChange={filters.setSpicy}
      />
      <FilterChip
        icon={Leaf}
        label={t('catalog.vegetarian')}
        pressed={filters.vegetarian}
        onChange={filters.setVegetarian}
      />
    </div>
  );
}

export default CatalogToolbar;
