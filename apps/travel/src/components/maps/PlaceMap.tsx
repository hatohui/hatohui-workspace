import { useTranslation } from '@hatohui/i18n';
import type { TravelPlaceSummaryDto } from '@hatohui/models';
import MapFrame from './MapFrame';

function PlaceMap({ place }: { place: TravelPlaceSummaryDto }) {
  const { t } = useTranslation();
  return (
    <MapFrame
      target={place}
      title={t('places.mapTitle', { name: place.name })}
      className="aspect-video sm:aspect-[21/9]"
    />
  );
}

export default PlaceMap;
