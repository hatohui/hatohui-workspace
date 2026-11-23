import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { Sparkles } from 'lucide-react';
import {
  FILTER_CHIP_PREVIEW_LIMIT,
  SPECIAL_ICONS,
} from '../../constants/travel';
import type { SpotFilters as Filters } from '../../hooks/useSpotFilterState';
import { useTagOptions } from '../../hooks/useTagOptions';
import CreatorFilter from '../catalog/CreatorFilter';
import FilterChipsSkeleton from '../catalog/FilterChipsSkeleton';
import FilterSection from '../catalog/FilterSection';
import TagChipGroup from '../shared/TagChipGroup';
import TriStateChipGroup from '../shared/TriStateChipGroup';

function SpotFilters({ filters }: { filters: Filters }) {
  const { t } = useTranslation();
  const tags = useTagOptions();

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
        <p className="text-[11px] text-foreground/65">
          {t('filters.specialHint')}
        </p>
      </FilterSection>
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

export default SpotFilters;
