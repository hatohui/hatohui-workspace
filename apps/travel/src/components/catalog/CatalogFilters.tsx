import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { ShieldAlert, Sparkles } from 'lucide-react';
import {
  ALLERGEN_ICONS,
  FILTER_CHIP_PREVIEW_LIMIT,
  SPECIAL_ICONS,
} from '../../constants/travel';
import {
  OTHER_TAGS_SKELETON_COUNT,
  SPECIAL_SKELETON_COUNT,
} from '../../constants/skeleton';
import { useCuisineNames } from '../../hooks/useCuisineNames';
import { usePlaceCategoryNames } from '../../hooks/usePlaceCategoryNames';
import { useTagOptions } from '../../hooks/useTagOptions';
import type { CatalogFilters as Filters } from '../../hooks/useTravelFilterState';
import TagChipGroup from '../shared/TagChipGroup';
import TriStateChipGroup from '../shared/TriStateChipGroup';
import CreatorFilter from './CreatorFilter';
import FilterChip from './FilterChip';
import FilterChipsSkeleton from './FilterChipsSkeleton';
import FilterSection from './FilterSection';

function CatalogFilters({ filters }: { filters: Filters }) {
  const { t } = useTranslation();
  const cuisines = useCuisineNames();
  const placeCategories = usePlaceCategoryNames();
  const tags = useTagOptions();

  return (
    <div className="space-y-4">
      <FilterSection title={t('filters.special')}>
        {tags.isLoading ? (
          <FilterChipsSkeleton count={SPECIAL_SKELETON_COUNT} />
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
        <p className="text-[11px] text-foreground/65">
          {t('filters.specialHint')}
        </p>
      </FilterSection>
      {(placeCategories.isLoading || placeCategories.names.length > 0) && (
        <FilterSection title={t('filters.placeCategories')}>
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
      )}
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
      {tags.isLoading && (
        <FilterSection title={t('form.otherTags')}>
          <FilterChipsSkeleton count={OTHER_TAGS_SKELETON_COUNT} />
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
          <FilterChipsSkeleton count={SPECIAL_SKELETON_COUNT} />
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
