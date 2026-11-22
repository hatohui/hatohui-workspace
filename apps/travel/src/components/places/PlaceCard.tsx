import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import type { TravelPlaceDto } from '@hatohui/models';
import { MapPin } from 'lucide-react';
import routes from '../../constants/routes';
import { useMyAllergies } from '../../hooks/useMyAllergies';
import {
  formatPlaceLocation,
  hasPlaceCoordinates,
} from '../../lib/formatPlaceLocation';
import ImageFrame from '../shared/ImageFrame';

function PlaceCard({ place }: { place: TravelPlaceDto }) {
  const { t } = useTranslation();
  const { cautionFor } = useMyAllergies();
  const location = formatPlaceLocation(place);
  const fallback = hasPlaceCoordinates(place)
    ? t('places.pinnedOnMap')
    : t('places.noLocation');

  return (
    <Link
      to={routes.place(place.id)}
      className="group flex flex-col gap-1.5 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <ImageFrame
        src={place.coverImageUrl}
        alt={place.name}
        caution={cautionFor(place.allergens)}
      />
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
    </Link>
  );
}

export default PlaceCard;
