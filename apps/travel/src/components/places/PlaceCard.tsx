import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import type { TravelPlaceDto } from '@hatohui/models';
import { MapPin } from 'lucide-react';
import routes from '../../constants/routes';
import { useMyAllergies } from '../../hooks/useMyAllergies';
import {
  formatPlaceLocation,
  hasPlaceCoordinates,
} from '../../lib/formatPlaceLocation';
import { isOptimisticId } from '../../lib/optimistic';
import CategoryChips from '../shared/CategoryChips';
import ImageFrame from '../shared/ImageFrame';
import OptimisticBadge from '../shared/OptimisticBadge';

function PlaceCard({ place }: { place: TravelPlaceDto }) {
  const { t } = useTranslation();
  const { cautionFor } = useMyAllergies();
  const location = formatPlaceLocation(place);
  const fallback = hasPlaceCoordinates(place)
    ? t('places.pinnedOnMap')
    : t('places.noLocation');
  const isOptimistic = isOptimisticId(place.id);
  const cardClass = cn(
    'group flex flex-col gap-1.5 rounded-xl text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
    isOptimistic && 'cursor-wait opacity-85',
  );

  const body = (
    <>
      <div className="relative w-full">
        <ImageFrame
          src={place.coverImageUrl}
          alt={place.name}
          caution={cautionFor(place.allergens)}
        />
        {isOptimistic && <OptimisticBadge />}
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-sm font-medium group-hover:underline">
          {place.name}
        </h2>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{location || fallback}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0">
            {t('places.dishCount', { count: place.dishCount })}
          </span>
        </p>
      </div>
      <CategoryChips categories={place.categories} />
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
    <Link to={routes.place(place.id)} className={cardClass}>
      {body}
    </Link>
  );
}

export default PlaceCard;
