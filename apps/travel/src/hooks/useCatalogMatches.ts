import { useMemo } from 'react';
import { useTravelDishes, useTravelPlaces } from '@hatohui/models';
import type { SearchSuggestion } from './useSearchSuggest';
import { useTravelLocation } from './useTravelLocation';

const normalize = (value: string) => value.trim().toLowerCase();

export function useCatalogMatches(dishName: string, placeName: string) {
  const dishesQuery = useTravelDishes();
  const location = useTravelLocation();
  const placesQuery = useTravelPlaces(location.filter);

  const dishes = useMemo(
    () => dishesQuery.data?.data ?? [],
    [dishesQuery.data?.data],
  );
  const places = useMemo(
    () => placesQuery.data?.data ?? [],
    [placesQuery.data?.data],
  );

  const dish = dishes.find((d) => normalize(d.name) === normalize(dishName));
  const place = places.find((p) => normalize(p.name) === normalize(placeName));

  const dishSuggestions = useMemo<SearchSuggestion[]>(
    () =>
      dishes.map((d) => ({
        id: d.id,
        label: d.name,
        sublabel: d.cuisines.join(', ') || null,
        imageUrl: d.coverImageUrl,
      })),
    [dishes],
  );

  const placeSuggestions = useMemo<SearchSuggestion[]>(
    () =>
      places.map((p) => ({
        id: p.id,
        label: p.name,
        sublabel: p.area?.name ?? p.city,
        imageUrl: p.coverImageUrl,
      })),
    [places],
  );

  return {
    dishSuggestions,
    placeSuggestions,
    dish,
    place,
  };
}
