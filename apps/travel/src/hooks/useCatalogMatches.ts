import { useTravelDishes, useTravelPlaces } from '@hatohui/models';
import { useTravelLocation } from './useTravelLocation';

const normalize = (value: string) => value.trim().toLowerCase();

export function useCatalogMatches(dishName: string, placeName: string) {
  const dishes = useTravelDishes().data?.data ?? [];
  const location = useTravelLocation();
  const places = useTravelPlaces(location.filter).data?.data ?? [];

  const dish = dishes.find((d) => normalize(d.name) === normalize(dishName));
  const place = places.find((p) => normalize(p.name) === normalize(placeName));

  return {
    dishOptions: dishes.map((d) => d.name),
    placeOptions: places.map((p) => p.name),
    dish,
    place,
  };
}
