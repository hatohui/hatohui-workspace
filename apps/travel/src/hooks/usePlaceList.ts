import { useMemo } from 'react';
import { useTravelPlaces } from '@hatohui/models';
import { usePagination } from './usePagination';
import type { SearchSuggestion } from './useSearchSuggest';
import type { TravelFilterState } from './useTravelFilterState';
import { useTravelLocation } from './useTravelLocation';

export function usePlaceList(state: TravelFilterState, enabled: boolean) {
  const location = useTravelLocation();
  const params = { ...state.queryParams, ...location.filter };
  const result = useTravelPlaces(params, { query: { enabled } });
  const places = useMemo(() => result.data?.data ?? [], [result.data?.data]);
  const suggestions = useMemo<SearchSuggestion[]>(
    () =>
      places.map((place) => ({
        id: place.id,
        label: place.name,
        sublabel:
          [...place.categories, place.area?.name].filter(Boolean).join(' · ') ||
          null,
        imageUrl: place.coverImageUrl,
      })),
    [places],
  );
  const pagination = usePagination(places, JSON.stringify(params));
  return {
    allPlaces: places,
    places: pagination.pagedItems,
    pagination,
    suggestions,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
  };
}
