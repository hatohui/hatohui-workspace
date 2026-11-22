import { useTranslation } from '@hatohui/i18n';
import AddRecommendationButton from '../components/catalog/AddRecommendationButton';
import CatalogSidebar from '../components/catalog/CatalogSidebar';
import ClearFiltersButton from '../components/catalog/ClearFiltersButton';
import MobileFilterButton from '../components/catalog/MobileFilterButton';
import RecommendationGrid from '../components/recommendation/RecommendationGrid';
import PageHeading from '../components/shared/PageHeading';
import PaginationBar from '../components/shared/PaginationBar';
import SearchField from '../components/shared/SearchField';
import { useCatalog } from '../hooks/useCatalog';

function CatalogPage() {
  const { t } = useTranslation();
  const catalog = useCatalog();
  const { filters } = catalog;

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
          <div className="flex items-center gap-2">
            <SearchField
              value={filters.search}
              placeholder={t('catalog.searchPlaceholder')}
              onChange={filters.setSearch}
              suggestions={catalog.suggestions}
            />
            <MobileFilterButton filters={filters} />
          </div>
          <RecommendationGrid
            recommendations={catalog.recommendations}
            isLoading={catalog.isLoading}
            isError={catalog.isError}
            onRetry={() => void catalog.refetch()}
            emptyMessage={t(
              catalog.isFiltered ? 'catalog.emptyFiltered' : 'catalog.empty',
            )}
            emptyAction={
              catalog.isFiltered && (
                <ClearFiltersButton onClick={filters.clearFilters} />
              )
            }
          />
          <PaginationBar
            page={catalog.pagination.page}
            pageSize={catalog.pagination.pageSize}
            totalItems={catalog.pagination.totalItems}
            totalPages={catalog.pagination.totalPages}
            onPageChange={catalog.pagination.setPage}
            onPageSizeChange={catalog.pagination.setPageSize}
          />
        </div>
      </div>
    </div>
  );
}

export default CatalogPage;
