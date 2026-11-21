import { useTravelDishes, useTravelPlaces } from '@hatohui/models';

const normalize = (value: string) => value.trim().toLowerCase();

export function useCatalogMatches(dishName: string, placeName: string) {
  const dishes = useTravelDishes().data?.data ?? [];
  const places = useTravelPlaces().data?.data ?? [];

  const dish = dishes.find((d) => normalize(d.name) === normalize(dishName));
  const place = places.find((p) => normalize(p.name) === normalize(placeName));

  return {
    dishOptions: dishes.map((d) => d.name),
    placeOptions: places.map((p) => p.name),
    dish,
    place,
  };
}
