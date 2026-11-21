import { useTranslation } from '@hatohui/i18n';
import type { TravelPlaceSummaryDto } from '@hatohui/models';
import { ExternalLink, MapPin } from 'lucide-react';
import { googleMapsLink } from '../../lib/googleMapsLink';

function PlaceMapsChip({ place }: { place: TravelPlaceSummaryDto }) {
  const { t } = useTranslation();
  return (
    <a
      href={googleMapsLink(place)}
      target="_blank"
      rel="noreferrer"
      title={t('recommendation.openMaps')}
      className="group/chip inline-flex max-w-full items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-sm hover:bg-card-hover"
    >
      <MapPin className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{place.name}</span>
      <ExternalLink
        className="size-3 shrink-0 text-muted-foreground opacity-60 group-hover/chip:opacity-100"
        aria-hidden
      />
    </a>
  );
}

export default PlaceMapsChip;
