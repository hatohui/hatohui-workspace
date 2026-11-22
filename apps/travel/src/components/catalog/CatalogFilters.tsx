import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { ShieldAlert, Sparkles } from 'lucide-react';
import type { FoodView } from '../../constants/food';
import {
  ALLERGEN_ICONS,
  FILTER_CHIP_PREVIEW_LIMIT,
  SPECIAL_ICONS,
} from '../../constants/travel';
import { useCuisineNames } from '../../hooks/useCuisineNames';
import { useFoodCategoryNames } from '../../hooks/useFoodCategoryNames';
import { usePlaceCategoryNames } from '../../hooks/usePlaceCategoryNames';
import { useTagOptions } from '../../hooks/useTagOptions';
import type { CatalogFilters as Filters } from '../../hooks/useTravelFilterState';
import TagChipGroup from '../shared/TagChipGroup';
import TriStateChipGroup from '../shared/TriStateChipGroup';
import CreatorFilter from './CreatorFilter';
import FilterChip from './FilterChip';
import FilterChipsSkeleton from './FilterChipsSkeleton';
import FilterSection from './FilterSection';

function CatalogFilters({
  filters,
  view = 'dishes',
  hideClear = false,
}: {
  filters: Filters;
  view?: FoodView;
  hideClear?: boolean;
}) {
  const { t } = useTranslation();
  const cuisines = useCuisineNames();
  const foodCategories = useFoodCategoryNames();
  const placeCategories = usePlaceCategoryNames();
  const tags = useTagOptions();

  const foodCategorySection =
    foodCategories.isLoading || foodCategories.names.length > 0 ? (
      <FilterSection key="foodCategories" title={t('filters.foodCategories')}>
        {foodCategories.isLoading ? (
          <FilterChipsSkeleton />
        ) : (
          <TagChipGroup
            label={t('filters.foodCategories')}
            options={foodCategories.names}
            selected={filters.foodCategories}
            labelOf={(name) => name}
            onToggle={filters.toggleFoodCategory}
            limit={FILTER_CHIP_PREVIEW_LIMIT}
          />
        )}
      </FilterSection>
    ) : null;

  const placeCategorySection =
    placeCategories.isLoading || placeCategories.names.length > 0 ? (
      <FilterSection key="placeCategories" title={t('filters.placeCategories')}>
        {placeCategories.isLoading ? (
          <FilterChipsSkeleton />
        ) : (
          <TagChipGroup
            label={t('filters.placeCategories')}
            options={placeCategories.names}
            selected={filters.placeCategories}
            labelOf={(name) => name}
            onToggle={filters.togglePlaceCategory}
            limit={FILTER_CHIP_PREVIEW_LIMIT}
          />
        )}
      </FilterSection>
    ) : null;

  const orderedCategorySections =
    view === 'places'
      ? [placeCategorySection, foodCategorySection]
      : [foodCategorySection, placeCategorySection];

  return (
    <div className="space-y-4">
      <FilterSection title={t('filters.special')}>
        {tags.isLoading ? (
          <FilterChipsSkeleton />
        ) : (
          <TriStateChipGroup
            label={t('filters.special')}
            options={tags.specialKeys}
            included={filters.includeSpecials}
            excluded={filters.excludeSpecials}
            labelOf={tags.labelOf}
            iconOf={(key) => SPECIAL_ICONS[key]}
            fallbackIcon={Sparkles}
            onCycle={filters.cycleSpecial}
            limit={FILTER_CHIP_PREVIEW_LIMIT}
          />
        )}
        <p className="text-[11px] text-muted-foreground">
          {t('filters.specialHint')}
        </p>
      </FilterSection>
      {orderedCategorySections}
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
      {!hideClear && filters.activeCount > 0 && (
        <Button variant="outline" size="sm" onClick={filters.clearFilters}>
          {t('catalog.clearFilters')}
        </Button>
      )}
    </div>
  );
}

export default CatalogFilters;
