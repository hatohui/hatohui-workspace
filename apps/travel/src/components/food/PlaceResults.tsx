import { useTranslation } from '@hatohui/i18n';
import { MapPin } from 'lucide-react';
import { PLACE_CARD_TAG_WIDTHS } from '../../constants/skeleton';
import { CARD_GRID_CLASS } from '../../constants/travel';
import type { usePlaceList } from '../../hooks/usePlaceList';
import { groupByCategory } from '../../lib/groupByCategory';
import ClearFiltersButton from '../catalog/ClearFiltersButton';
import PlaceCard from '../places/PlaceCard';
import CardGridSkeleton from '../shared/CardGridSkeleton';
import ListState from '../shared/ListState';
import CategoryGroupList from './CategoryGroupList';

interface Props {
  list: ReturnType<typeof usePlaceList>;
  groupByCategory: boolean;
  activeCategories: string[];
  isFiltered: boolean;
  onClearFilters: () => void;
}

function PlaceResults({
  list,
  groupByCategory: isGrouped,
  activeCategories,
  isFiltered,
  onClearFilters,
}: Props) {
  const { t } = useTranslation();
  const groups = isGrouped
    ? groupByCategory(
        list.allPlaces,
        (place) => place.categories,
        activeCategories,
        t('catalog.uncategorized'),
      )
    : [];

  return (
    <ListState
      isLoading={list.isLoading}
      skeleton={
        <CardGridSkeleton
          count={list.pageSize}
          tagWidths={PLACE_CARD_TAG_WIDTHS}
        />
      }
      isError={list.isError}
      isEmpty={!(isGrouped ? list.allPlaces.length : list.places.length)}
      onRetry={() => void list.refetch()}
      emptyIcon={MapPin}
      emptyMessage={t(isFiltered ? 'catalog.emptyFiltered' : 'places.empty')}
      emptyAction={
        isFiltered && <ClearFiltersButton onClick={onClearFilters} />
      }
    >
      {isGrouped ? (
        <CategoryGroupList
          groups={groups}
          renderItem={(place) => <PlaceCard place={place} />}
        />
      ) : (
        <div className={CARD_GRID_CLASS}>
          {list.places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </ListState>
  );
}

export default PlaceResults;
