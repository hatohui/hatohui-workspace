import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import type { TravelPlaceDto } from '@hatohui/models';
import { MapPin } from 'lucide-react';
import routes from '../../constants/routes';
import {
  formatPlaceLocation,
  hasPlaceCoordinates,
} from '../../lib/formatPlaceLocation';
import ImageFrame from '../shared/ImageFrame';

function PlaceCard({ place }: { place: TravelPlaceDto }) {
  const { t } = useTranslation();
  const location = formatPlaceLocation(place);
  const fallback = hasPlaceCoordinates(place)
    ? t('places.pinnedOnMap')
    : t('places.noLocation');

  return (
    <Link
      to={routes.place(place.id)}
      className="group flex flex-col gap-2 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <ImageFrame src={place.coverImageUrl} alt={place.name} />
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="truncate text-lg font-medium tracking-tight group-hover:underline">
          {place.name}
        </h2>
        <span className="shrink-0 text-sm text-muted-foreground">
          {t('places.dishCount', { count: place.dishCount })}
        </span>
      </div>
      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">{location || fallback}</span>
      </span>
    </Link>
  );
}

export default PlaceCard;
