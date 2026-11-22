import { useTranslation } from '@hatohui/i18n';
import { MapPinned } from 'lucide-react';
import { CARD_GRID_CLASS } from '../../constants/travel';
import type { useSpotList } from '../../hooks/useSpotList';
import { groupByCategory } from '../../lib/groupByCategory';
import ClearFiltersButton from '../catalog/ClearFiltersButton';
import CategoryGroupList from '../food/CategoryGroupList';
import ListState from '../shared/ListState';
import SpotCard from './SpotCard';

interface Props {
  list: ReturnType<typeof useSpotList>;
  groupByCategory: boolean;
  activeCategories: string[];
  isFiltered: boolean;
  onClearFilters: () => void;
}

function SpotResults({
  list,
  groupByCategory: isGrouped,
  activeCategories,
  isFiltered,
  onClearFilters,
}: Props) {
  const { t } = useTranslation();
  const groups = isGrouped
    ? groupByCategory(
        list.allSpots,
        (spot) => spot.categories,
        activeCategories,
        t('catalog.uncategorized'),
      )
    : [];

  return (
    <ListState
      isLoading={list.isLoading}
      isError={list.isError}
      isEmpty={!(isGrouped ? list.allSpots.length : list.spots.length)}
      onRetry={() => void list.refetch()}
      emptyIcon={MapPinned}
      emptyMessage={t(isFiltered ? 'spots.emptyFiltered' : 'spots.empty')}
      emptyAction={
        isFiltered && <ClearFiltersButton onClick={onClearFilters} />
      }
    >
      {isGrouped ? (
        <CategoryGroupList
          groups={groups}
          renderItem={(spot) => <SpotCard spot={spot} />}
        />
      ) : (
        <div className={CARD_GRID_CLASS}>
          {list.spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </ListState>
  );
}

export default SpotResults;
