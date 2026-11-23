import { useTranslation } from '@hatohui/i18n';
import { ErrorState } from '@hatohui/ui';
import PlaceMap from '../../../components/maps/PlaceMap';
import PhotoCarousel from '../../../components/recommendation/PhotoCarousel';
import BackLink from '../../../components/shared/BackLink';
import DetailPageSkeleton from '../../../components/shared/DetailPageSkeleton';
import SpotHeader from '../../../components/spots/SpotHeader';
import routes from '../../../constants/routes';
import { useSpotDetail } from '../../../hooks/useSpotDetail';

function SpotDetailPage() {
  const { t } = useTranslation();
  const { spot, isLoading, isError, refetch, deletion } = useSpotDetail();

  if (isLoading) return <DetailPageSkeleton withImage={true} />;
  if (isError || !spot) {
    return (
      <ErrorState
        message={t('common:errors.notFound')}
        retry={{ label: t('common:retry'), onClick: () => void refetch() }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <BackLink to={routes.spots} label={t('spots.back')} />
      <SpotHeader spot={spot} deletion={deletion} />
      {spot.images.length > 0 && (
        <div className="max-w-2xl">
          <PhotoCarousel images={spot.images} alt={spot.name} />
        </div>
      )}
      <PlaceMap place={spot} />
    </div>
  );
}

export default SpotDetailPage;
