import { useTranslation } from '@hatohui/i18n';
import { MapPin } from 'lucide-react';
import PlaceCard from '../../components/places/PlaceCard';
import ListState from '../../components/shared/ListState';
import PageHeading from '../../components/shared/PageHeading';
import PaginationBar from '../../components/shared/PaginationBar';
import SearchField from '../../components/shared/SearchField';
import { usePlaceList } from '../../hooks/usePlaceList';

function PlacesPage() {
  const { t } = useTranslation();
  const list = usePlaceList();

  return (
    <div className="space-y-6">
      <PageHeading title={t('places.title')} subtitle={t('places.subtitle')} />
      <SearchField
        value={list.search}
        placeholder={t('places.searchPlaceholder')}
        onChange={list.setSearch}
        suggestions={list.suggestions}
      />
      <ListState
        isLoading={list.isLoading}
        isError={list.isError}
        isEmpty={!list.places.length}
        onRetry={() => void list.refetch()}
        emptyIcon={MapPin}
        emptyMessage={t('places.empty')}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-3">
          {list.places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </ListState>
      <PaginationBar
        page={list.pagination.page}
        pageSize={list.pagination.pageSize}
        totalItems={list.pagination.totalItems}
        totalPages={list.pagination.totalPages}
        onPageChange={list.pagination.setPage}
        onPageSizeChange={list.pagination.setPageSize}
      />
    </div>
  );
}

export default PlacesPage;
