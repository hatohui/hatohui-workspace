import { useTranslation } from '@hatohui/i18n';
import AddRecommendationButton from '../components/catalog/AddRecommendationButton';
import CatalogToolbar from '../components/catalog/CatalogToolbar';
import ClearFiltersButton from '../components/catalog/ClearFiltersButton';
import RecommendationGrid from '../components/recommendation/RecommendationGrid';
import PageHeading from '../components/shared/PageHeading';
import { useCatalog } from '../hooks/useCatalog';

function CatalogPage() {
  const { t } = useTranslation();
  const catalog = useCatalog();

  return (
    <div className="space-y-4">
      <PageHeading
        title={t('catalog.title')}
        subtitle={t('catalog.subtitle')}
        action={<AddRecommendationButton />}
      />
      <CatalogToolbar filters={catalog.filters} />
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
            <ClearFiltersButton onClick={catalog.clearFilters} />
          )
        }
      />
    </div>
  );
}

export default CatalogPage;
