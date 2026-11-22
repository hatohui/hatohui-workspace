import type { TravelPlaceSummaryDto } from '@hatohui/models';
import { MAPS_SEARCH_URL } from '../constants/maps';

export function googleMapsLink(place: TravelPlaceSummaryDto): string {
  if (place.mapsUrl) return place.mapsUrl;
  const query =
    place.latitude != null && place.longitude != null
      ? `${place.latitude},${place.longitude}`
      : [place.name, place.address, place.area?.name]
          .filter(Boolean)
          .join(', ');
  const params = new URLSearchParams({ api: '1', query });
  return `${MAPS_SEARCH_URL}?${params.toString()}`;
}
