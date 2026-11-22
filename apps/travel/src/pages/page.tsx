import { useTranslation } from '@hatohui/i18n';
import AddRecommendationButton from '../components/catalog/AddRecommendationButton';
import CatalogSidebar from '../components/catalog/CatalogSidebar';
import MobileFilterButton from '../components/catalog/MobileFilterButton';
import DishResults from '../components/food/DishResults';
import FoodViewSwitch from '../components/food/FoodViewSwitch';
import GroupByCategoryToggle from '../components/food/GroupByCategoryToggle';
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('catalog.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('catalog.subtitle')}
          </p>
        </div>
        <AddRecommendationButton />
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <CatalogSidebar filters={filters} view={food.view} />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-52 flex-1 items-center gap-2 sm:max-w-sm">
              <SearchField
                value={filters.search}
                placeholder={t(food.searchKey)}
                onChange={filters.setSearch}
                suggestions={active.suggestions}
              />
              <MobileFilterButton filters={filters} view={food.view} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <GroupByCategoryToggle
                active={food.groupByCategory}
                onToggle={food.toggleGroupByCategory}
              />
              <FoodViewSwitch value={food.view} onChange={food.setView} />
            </div>
          </div>
          {!active.isLoading && !active.isError && (
            <p className="text-xs text-muted-foreground tabular-nums">
              {t(food.countKey, { count: active.pagination.totalItems })}
            </p>
          )}
          {food.view === 'dishes' ? (
            <DishResults
              list={food.dishes}
              groupByCategory={food.groupByCategory}
              activeCategories={filters.foodCategories}
              {...results}
            />
          ) : (
            <PlaceResults
              list={food.places}
              groupByCategory={food.groupByCategory}
              activeCategories={filters.placeCategories}
              {...results}
            />
          )}
          {!food.groupByCategory && (
            <PaginationBar
              page={active.pagination.page}
              totalPages={active.pagination.totalPages}
              onPageChange={active.pagination.setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodPage;
