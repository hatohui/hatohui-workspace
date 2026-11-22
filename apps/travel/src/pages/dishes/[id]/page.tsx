import { useTranslation } from '@hatohui/i18n';
import { ErrorState } from '@hatohui/ui';
import AddRecommendationButton from '../../../components/catalog/AddRecommendationButton';
import DishHeader from '../../../components/dishes/DishHeader';
import RecommendationGrid from '../../../components/recommendation/RecommendationGrid';
import BackLink from '../../../components/shared/BackLink';
import CardGridSkeleton from '../../../components/shared/CardGridSkeleton';
import routes from '../../../constants/routes';
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
      <BackLink to={routes.dishes} label={t('dishes.back')} />
      <DishHeader dish={dish} deletion={deletion} />
      <section className="space-y-4">
        <h2 className="text-xl font-medium tracking-tight">
          {t('dishes.whereToEat')}
        </h2>
        <RecommendationGrid
          recommendations={dish.recommendations}
          labelMode="place"
          isLoading={false}
          isError={false}
          onRetry={() => void refetch()}
          emptyMessage={t('dishes.noPlacesBody')}
          emptyAction={
            <AddRecommendationButton
              dishName={dish.name}
              labelKey="dishes.addPlace"
            />
          }
        />
      </section>
    </div>
  );
}

export default DishPage;
