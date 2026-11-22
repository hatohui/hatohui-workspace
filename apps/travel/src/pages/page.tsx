import { useTranslation } from '@hatohui/i18n';
import AddRecommendationButton from '../components/catalog/AddRecommendationButton';
import CatalogSidebar from '../components/catalog/CatalogSidebar';
import MobileFilterButton from '../components/catalog/MobileFilterButton';
import DishResults from '../components/food/DishResults';
import FoodViewSwitch from '../components/food/FoodViewSwitch';
import PlaceResults from '../components/food/PlaceResults';
import PaginationBar from '../components/shared/PaginationBar';
import SearchField from '../components/shared/SearchField';
import { useFoodBrowse } from '../hooks/useFoodBrowse';

function FoodPage() {
  const { t } = useTranslation();
  const food = useFoodBrowse();
  const { filters, active } = food;
  const results = {
    isFiltered: food.isFiltered,
    onClearFilters: filters.clearFilters,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[176px_minmax(0,1fr)]">
      <h1 className="sr-only">{t('catalog.title')}</h1>
      <CatalogSidebar filters={filters} />
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <FoodViewSwitch value={food.view} onChange={food.setView} />
          <div className="flex min-w-48 flex-1 items-center gap-2">
            <SearchField
              value={filters.search}
              placeholder={t(food.searchKey)}
              onChange={filters.setSearch}
              suggestions={active.suggestions}
            />
            <MobileFilterButton filters={filters} />
          </div>
          <AddRecommendationButton />
        </div>
        {!active.isLoading && !active.isError && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {t(food.countKey, { count: active.pagination.totalItems })}
          </p>
        )}
        {food.view === 'dishes' ? (
          <DishResults list={food.dishes} {...results} />
        ) : (
          <PlaceResults list={food.places} {...results} />
        )}
        <PaginationBar
          page={active.pagination.page}
          pageSize={active.pagination.pageSize}
          totalItems={active.pagination.totalItems}
          totalPages={active.pagination.totalPages}
          onPageChange={active.pagination.setPage}
          onPageSizeChange={active.pagination.setPageSize}
        />
      </div>
    </div>
  );
}

export default FoodPage;
