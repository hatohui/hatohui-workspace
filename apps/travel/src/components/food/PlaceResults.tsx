import { useTranslation } from '@hatohui/i18n';
import { MapPin } from 'lucide-react';
import type { usePlaceList } from '../../hooks/usePlaceList';
import ClearFiltersButton from '../catalog/ClearFiltersButton';
import PlaceCard from '../places/PlaceCard';
import ListState from '../shared/ListState';

interface Props {
  list: ReturnType<typeof usePlaceList>;
  isFiltered: boolean;
  onClearFilters: () => void;
}

function PlaceResults({ list, isFiltered, onClearFilters }: Props) {
  const { t } = useTranslation();
  return (
    <ListState
      isLoading={list.isLoading}
      isError={list.isError}
      isEmpty={!list.places.length}
      onRetry={() => void list.refetch()}
      emptyIcon={MapPin}
      emptyMessage={t(isFiltered ? 'catalog.emptyFiltered' : 'places.empty')}
      emptyAction={
        isFiltered && <ClearFiltersButton onClick={onClearFilters} />
      }
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-3">
        {list.places.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </ListState>
  );
}

export default PlaceResults;
