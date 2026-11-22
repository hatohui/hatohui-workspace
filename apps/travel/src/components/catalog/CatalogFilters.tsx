import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { Flame } from 'lucide-react';
import { ALLERGEN_ICONS, DIET_ICONS } from '../../constants/travel';
import { useTagOptions } from '../../hooks/useTagOptions';
import type { CatalogFilters as Filters } from '../../hooks/useCatalog';
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
    <div className="space-y-6">
      <FilterSection title={t('filters.taste')}>
        <FilterChip
          icon={Flame}
          label={t('catalog.spicy')}
          pressed={filters.spicy}
          onChange={filters.setSpicy}
        />
      </FilterSection>
      <FilterSection title={t('form.diets')}>
        {tags.isLoading ? (
          <FilterChipsSkeleton />
        ) : (
          <TagChipGroup
            label={t('form.diets')}
            options={tags.dietKeys}
            selected={filters.diets}
            labelOf={tags.labelOf}
            iconOf={(tag) => DIET_ICONS[tag]}
            onToggle={filters.toggleDiet}
          />
        )}
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
          />
        </FilterSection>
      )}
      <FilterSection title={t('catalog.avoidAllergens')}>
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
