import { useTranslation } from '@hatohui/i18n';
import ClearFiltersButton from '../../components/catalog/ClearFiltersButton';
import CatalogSortSelect from '../../components/food/CatalogSortSelect';
import GroupByCategoryToggle from '../../components/food/GroupByCategoryToggle';
import PaginationBar from '../../components/shared/PaginationBar';
import SearchField from '../../components/shared/SearchField';
import AddSpotButton from '../../components/spots/AddSpotButton';
import MobileSpotFilterButton from '../../components/spots/MobileSpotFilterButton';
import SpotCategoryBar from '../../components/spots/SpotCategoryBar';
import SpotResults from '../../components/spots/SpotResults';
import SpotSidebar from '../../components/spots/SpotSidebar';
import { useSpotFilterState } from '../../hooks/useSpotFilterState';
import { useSpotList } from '../../hooks/useSpotList';

function SpotsPage() {
  const { t } = useTranslation();
  const state = useSpotFilterState();
  const list = useSpotList(state, state.groupByCategory);
  const { filters } = state;

  return (
    <div className="space-y-4">
      <h1 className="sr-only">{t('spots.title')}</h1>
      <SpotCategoryBar
        selected={filters.spotCategories}
        onToggle={filters.toggleSpotCategory}
        onClear={filters.clearSpotCategories}
      />
      <div className="grid gap-6 lg:grid-cols-[192px_minmax(0,1fr)]">
        <SpotSidebar filters={filters} />
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <GroupByCategoryToggle
              active={state.groupByCategory}
              onToggle={state.toggleGroupByCategory}
            />
            <div className="flex min-w-48 flex-1 items-center gap-2">
              <SearchField
                value={filters.search}
                placeholder={t('spots.searchPlaceholder')}
                onChange={filters.setSearch}
                suggestions={list.suggestions}
              />
              <MobileSpotFilterButton filters={filters} />
            </div>
            <AddSpotButton />
          </div>
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {!list.isLoading && !list.isError && (
                <p className="text-xs text-muted-foreground tabular-nums">
                  {t('spots.spotTotal', { count: list.pagination.totalItems })}
                </p>
              )}
              {state.isFiltered && (
                <ClearFiltersButton
                  variant="ghost"
                  count={filters.activeCount}
                  onClick={filters.clearFilters}
                />
              )}
            </div>
            <CatalogSortSelect
              view="spots"
              value={filters.sort}
              onChange={filters.setSort}
            />
          </div>
          <SpotResults
            list={list}
            groupByCategory={state.groupByCategory}
            activeCategories={filters.spotCategories}
            isFiltered={state.isFiltered}
            onClearFilters={filters.clearFilters}
          />
          {!state.groupByCategory && (
            <PaginationBar
              page={list.pagination.page}
              totalPages={list.pagination.totalPages}
              onPageChange={list.pagination.setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default SpotsPage;
