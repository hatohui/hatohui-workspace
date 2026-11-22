import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { Flame, Leaf, ShieldAlert } from 'lucide-react';
import { VEGETARIAN_TAG } from '../../constants/food';
import {
  ALLERGEN_ICONS,
  FILTER_CHIP_PREVIEW_LIMIT,
} from '../../constants/travel';
import { useTagOptions } from '../../hooks/useTagOptions';
import type { CatalogFilters as Filters } from '../../hooks/useTravelFilterState';
import { useCuisineNames } from '../../hooks/useCuisineNames';
import TagChipGroup from '../shared/TagChipGroup';
import CreatorFilter from './CreatorFilter';
import FilterChip from './FilterChip';
import FilterChipsSkeleton from './FilterChipsSkeleton';
import FilterSection from './FilterSection';

function CatalogFilters({ filters }: { filters: Filters }) {
  const { t } = useTranslation();
  const cuisines = useCuisineNames();
  const tags = useTagOptions();

  return (
    <div className="space-y-4">
      <FilterSection title={t('filters.taste')}>
        <div className="flex flex-wrap gap-1">
          <FilterChip
            icon={Flame}
            label={t('catalog.spicy')}
            pressed={filters.spicy}
            onChange={filters.setSpicy}
          />
          <FilterChip
            icon={Leaf}
            label={t('catalog.vegetarian')}
            pressed={filters.diets.includes(VEGETARIAN_TAG)}
            onChange={() => filters.toggleDiet(VEGETARIAN_TAG)}
          />
        </div>
      </FilterSection>
      {cuisines.isLoading && (
        <FilterSection title={t('form.cuisines')}>
          <FilterChipsSkeleton />
        </FilterSection>
      )}
      {cuisines.names.length > 0 && (
        <FilterSection title={t('form.cuisines')}>
          <TagChipGroup
            label={t('form.cuisines')}
            options={cuisines.names}
            selected={filters.cuisines}
            labelOf={(name) => name}
            onToggle={filters.toggleCuisine}
            limit={FILTER_CHIP_PREVIEW_LIMIT}
          />
        </FilterSection>
      )}
      {tags.generalKeys.length > 0 && (
        <FilterSection title={t('form.otherTags')}>
          <TagChipGroup
            label={t('form.otherTags')}
            options={tags.generalKeys}
            selected={filters.tags}
            labelOf={tags.labelOf}
            onToggle={filters.toggleTag}
            limit={FILTER_CHIP_PREVIEW_LIMIT}
          />
        </FilterSection>
      )}
      <FilterSection title={t('catalog.avoidAllergens')}>
        {filters.myAllergenCount > 0 && (
          <FilterChip
            icon={ShieldAlert}
            label={t('catalog.hideMyAllergens', {
              count: filters.myAllergenCount,
            })}
            pressed={filters.hideMine}
            onChange={filters.setHideMine}
          />
        )}
        {tags.isLoading ? (
          <FilterChipsSkeleton />
        ) : (
          <TagChipGroup
            label={t('catalog.avoidAllergens')}
            tone="warning"
            options={tags.allergenKeys}
            selected={filters.avoid}
            labelOf={tags.labelOf}
            iconOf={(tag) => ALLERGEN_ICONS[tag]}
            onToggle={filters.toggleAvoid}
            limit={FILTER_CHIP_PREVIEW_LIMIT}
          />
        )}
      </FilterSection>
      <FilterSection title={t('filters.addedBy')}>
        <CreatorFilter value={filters.by} onChange={filters.setBy} />
      </FilterSection>
      {filters.activeCount > 0 && (
        <Button variant="outline" size="sm" onClick={filters.clearFilters}>
          {t('catalog.clearFilters')}
        </Button>
      )}
    </div>
  );
}

export default CatalogFilters;
