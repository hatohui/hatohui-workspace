import { useTranslation } from '@hatohui/i18n';
import AddRecommendationButton from '../components/catalog/AddRecommendationButton';
import CatalogSidebar from '../components/catalog/CatalogSidebar';
import MobileFilterButton from '../components/catalog/MobileFilterButton';
import DishResults from '../components/food/DishResults';
import FoodViewSwitch from '../components/food/FoodViewSwitch';
import PlaceResults from '../components/food/PlaceResults';
import PageHeading from '../components/shared/PageHeading';
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
    <div className="space-y-6">
      <PageHeading
        title={t('catalog.title')}
        subtitle={t('catalog.subtitle')}
        action={<AddRecommendationButton />}
      />
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <CatalogSidebar filters={filters} />
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <FoodViewSwitch value={food.view} onChange={food.setView} />
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <SearchField
                value={filters.search}
                placeholder={t(food.searchKey)}
                onChange={filters.setSearch}
                suggestions={active.suggestions}
              />
              <MobileFilterButton filters={filters} />
            </div>
          </div>
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
    </div>
  );
}

export default FoodPage;
