import { useTranslation } from '@hatohui/i18n';
import { Soup } from 'lucide-react';
import CatalogSidebar from '../../components/catalog/CatalogSidebar';
import ClearFiltersButton from '../../components/catalog/ClearFiltersButton';
import MobileFilterButton from '../../components/catalog/MobileFilterButton';
import DishCard from '../../components/dishes/DishCard';
import ListState from '../../components/shared/ListState';
import PageHeading from '../../components/shared/PageHeading';
import PaginationBar from '../../components/shared/PaginationBar';
import SearchField from '../../components/shared/SearchField';
import { useDishList } from '../../hooks/useDishList';

function DishesPage() {
  const { t } = useTranslation();
  const list = useDishList();
  const { filters } = list;

  return (
    <div className="space-y-6">
      <PageHeading title={t('dishes.title')} subtitle={t('dishes.subtitle')} />
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <CatalogSidebar filters={filters} />
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <SearchField
              value={filters.search}
              placeholder={t('dishes.searchPlaceholder')}
              onChange={filters.setSearch}
              suggestions={list.suggestions}
            />
            <MobileFilterButton filters={filters} />
          </div>
          <ListState
            isLoading={list.isLoading}
            isError={list.isError}
            isEmpty={!list.dishes.length}
            onRetry={() => void list.refetch()}
            emptyIcon={Soup}
            emptyMessage={t(
              list.isFiltered ? 'catalog.emptyFiltered' : 'dishes.empty',
            )}
            emptyAction={
              list.isFiltered && (
                <ClearFiltersButton onClick={filters.clearFilters} />
              )
            }
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-3">
              {list.dishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
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
      </div>
    </div>
  );
}

export default DishesPage;
