import { useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useDebouncedValue } from '@hatohui/libs';
import { useTravelDishes, useTravelPlaces } from '@hatohui/models';
import { SEARCH_DEBOUNCE_MS } from '../constants/travel';
import type { SearchSuggestion } from './useSearchSuggest';
import { useTravelLocation } from './useTravelLocation';

const normalize = (value: string) => value.trim().toLowerCase();

export function useCatalogMatches(dishName: string, placeName: string) {
  const location = useTravelLocation();
  const dishQ = useDebouncedValue(dishName.trim(), SEARCH_DEBOUNCE_MS);
  const placeQ = useDebouncedValue(placeName.trim(), SEARCH_DEBOUNCE_MS);

  const dishesQuery = useTravelDishes(
    { q: dishQ },
    { query: { enabled: dishQ !== '', placeholderData: keepPreviousData } },
  );
  const placesQuery = useTravelPlaces(
    { q: placeQ, ...location.filter },
    { query: { enabled: placeQ !== '', placeholderData: keepPreviousData } },
  );

  const dishes = useMemo(
    () => (dishQ ? (dishesQuery.data?.data ?? []) : []),
    [dishQ, dishesQuery.data?.data],
  );
  const places = useMemo(
    () => (placeQ ? (placesQuery.data?.data ?? []) : []),
    [placeQ, placesQuery.data?.data],
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
        sublabel: p.area?.name ?? null,
        imageUrl: p.coverImageUrl,
      })),
    [places],
  );

  return { dishSuggestions, placeSuggestions, dish, place };
}
