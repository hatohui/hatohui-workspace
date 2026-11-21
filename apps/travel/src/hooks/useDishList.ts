import { useMemo } from 'react';
import { useTravelDishes } from '@hatohui/models';
import { useSearchState } from './useSearchState';
import type { SearchSuggestion } from './useSearchSuggest';
import { useTravelLocation } from './useTravelLocation';

export function useDishList() {
  const { search, setSearch, query } = useSearchState();
  const location = useTravelLocation();
  const result = useTravelDishes({ q: query, ...location.filter });
  const dishes = useMemo(() => result.data?.data ?? [], [result.data?.data]);
  const suggestions = useMemo<SearchSuggestion[]>(
    () =>
      dishes.map((dish) => ({
        id: dish.id,
        label: dish.name,
        sublabel: dish.cuisines.join(', ') || null,
        imageUrl: dish.coverImageUrl,
      })),
    [dishes],
  );
  return {
    dishes,
    suggestions,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    search,
    setSearch,
  };
}
