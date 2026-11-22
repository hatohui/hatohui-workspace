import type { TravelDishDto } from '@hatohui/models';

type Availability = Pick<TravelDishDto, 'placeCount' | 'localPlaceCount'>;

export function dishAvailability({
  placeCount,
  localPlaceCount,
}: Availability) {
  if (localPlaceCount !== null) {
    return localPlaceCount > 0
      ? { key: 'dishes.placesHere', count: localPlaceCount, isMissing: false }
      : { key: 'dishes.notFoundHere', count: 0, isMissing: true };
  }
  return placeCount > 0
    ? { key: 'dishes.placeCount', count: placeCount, isMissing: false }
    : { key: 'dishes.noPlacesYet', count: 0, isMissing: true };
}
