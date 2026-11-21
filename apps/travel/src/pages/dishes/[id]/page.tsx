import { useTranslation } from '@hatohui/i18n';
import { ErrorState } from '@hatohui/ui';
import DishHeader from '../../../components/dishes/DishHeader';
import RecommendationGrid from '../../../components/recommendation/RecommendationGrid';
import CardGridSkeleton from '../../../components/shared/CardGridSkeleton';
import { useDishDetail } from '../../../hooks/useDishDetail';

function DishPage() {
  const { t } = useTranslation();
  const { dish, isLoading, isError, refetch, deletion } = useDishDetail();

  if (isLoading) return <CardGridSkeleton />;
  if (isError || !dish) {
    return (
      <ErrorState
        message={t('common:errors.notFound')}
        retry={{ label: t('common:retry'), onClick: () => void refetch() }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <DishHeader dish={dish} deletion={deletion} />
      <section className="space-y-4">
        <h2 className="text-xl font-medium tracking-tight">
          {t('dishes.whereToEat')}
        </h2>
        <RecommendationGrid
          recommendations={dish.recommendations}
          isLoading={false}
          isError={false}
          onRetry={() => void refetch()}
          emptyMessage={t('catalog.empty')}
        />
      </section>
    </div>
  );
}

export default DishPage;
