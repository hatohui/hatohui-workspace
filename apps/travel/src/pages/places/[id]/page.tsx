import { useTranslation } from '@hatohui/i18n';
import { ErrorState } from '@hatohui/ui';
import PlaceHeader from '../../../components/places/PlaceHeader';
import PlaceMap from '../../../components/maps/PlaceMap';
import RecommendationGrid from '../../../components/recommendation/RecommendationGrid';
import CardGridSkeleton from '../../../components/shared/CardGridSkeleton';
import { usePlaceDetail } from '../../../hooks/usePlaceDetail';

function PlacePage() {
  const { t } = useTranslation();
  const { place, isLoading, isError, refetch, deletion } = usePlaceDetail();

  if (isLoading) return <CardGridSkeleton />;
  if (isError || !place) {
    return (
      <ErrorState
        message={t('common:errors.notFound')}
        retry={{ label: t('common:retry'), onClick: () => void refetch() }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PlaceHeader place={place} deletion={deletion} />
      <PlaceMap place={place} />
      <section className="space-y-4">
        <h2 className="text-xl font-medium tracking-tight">
          {t('places.whatToOrder')}
        </h2>
        <RecommendationGrid
          recommendations={place.recommendations}
          isLoading={false}
          isError={false}
          onRetry={() => void refetch()}
          emptyMessage={t('catalog.empty')}
        />
      </section>
    </div>
  );
}

export default PlacePage;
