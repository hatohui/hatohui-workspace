import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import type { TravelSpotDto } from '@hatohui/models';
import { MapPin } from 'lucide-react';
import routes from '../../constants/routes';
import {
  formatPlaceLocation,
  hasPlaceCoordinates,
} from '../../lib/formatPlaceLocation';
import { isOptimisticId } from '../../lib/optimistic';
import CategoryChips from '../shared/CategoryChips';
import ImageFrame from '../shared/ImageFrame';
import OptimisticBadge from '../shared/OptimisticBadge';
import SpotTagBadges from './SpotTagBadges';

function SpotCard({ spot }: { spot: TravelSpotDto }) {
  const { t } = useTranslation();
  const location = formatPlaceLocation(spot);
  const fallback = hasPlaceCoordinates(spot)
    ? t('spots.pinnedOnMap')
    : t('spots.noLocation');
  const isOptimistic = isOptimisticId(spot.id);
  const cardClass = cn(
    'group flex flex-col gap-1.5 rounded-xl text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
    isOptimistic && 'cursor-wait opacity-85',
  );

  const body = (
    <>
      <div className="relative w-full">
        <ImageFrame src={spot.coverImageUrl} alt={spot.name} />
        {isOptimistic && <OptimisticBadge />}
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-sm font-medium group-hover:underline">
          {spot.name}
        </h2>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{location || fallback}</span>
          {spot.images.length > 0 && (
            <>
              <span aria-hidden>·</span>
              <span className="shrink-0">
                {t('recommendation.photos', { count: spot.images.length })}
              </span>
            </>
          )}
        </p>
      </div>
      <CategoryChips categories={spot.categories} />
      <SpotTagBadges specials={spot.specials} tags={spot.tags} limit={2} />
    </>
  );

  if (isOptimistic) {
    return (
      <div aria-busy="true" className={cardClass}>
        {body}
      </div>
    );
  }

  return (
    <Link to={routes.spot(spot.id)} className={cardClass}>
      {body}
    </Link>
  );
}

export default SpotCard;
