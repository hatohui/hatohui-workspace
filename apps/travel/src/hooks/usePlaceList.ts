import { useMemo } from 'react';
import { useTravelPlaces } from '@hatohui/models';
import { usePagination } from './usePagination';
import { useSearchState } from './useSearchState';
import type { SearchSuggestion } from './useSearchSuggest';
import { useTravelLocation } from './useTravelLocation';

export function usePlaceList() {
  const { search, setSearch, query } = useSearchState();
  const location = useTravelLocation();
  const result = useTravelPlaces({ q: query, ...location.filter });
  const places = useMemo(() => result.data?.data ?? [], [result.data?.data]);
  const suggestions = useMemo<SearchSuggestion[]>(
    () =>
      places.map((place) => ({
        id: place.id,
        label: place.name,
        sublabel: place.area?.name ?? place.city,
        imageUrl: place.coverImageUrl,
      })),
    [places],
  );
  const resetKey = JSON.stringify({ q: query, ...location.filter });
  const pagination = usePagination(places, resetKey);
  return {
    places: pagination.pagedItems,
    pagination,
    suggestions,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    search,
    setSearch,
  };
}
