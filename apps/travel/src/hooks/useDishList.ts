import { useMemo } from 'react';
import { useTravelDishes } from '@hatohui/models';
import { usePagination } from './usePagination';
import type { SearchSuggestion } from './useSearchSuggest';
import type { TravelFilterState } from './useTravelFilterState';
import { useTravelLocation } from './useTravelLocation';

export function useDishList(state: TravelFilterState, enabled: boolean) {
  const location = useTravelLocation();
  const params = { ...state.queryParams, ...location.filter };
  const result = useTravelDishes(params, { query: { enabled } });
  const dishes = useMemo(() => result.data?.data ?? [], [result.data?.data]);
  const suggestions = useMemo<SearchSuggestion[]>(
    () =>
      dishes.map((dish) => ({
        id: dish.id,
        label: dish.name,
        sublabel: [...dish.categories, ...dish.cuisines].join(', ') || null,
        imageUrl: dish.coverImageUrl,
      })),
    [dishes],
  );
  const pagination = usePagination(dishes, JSON.stringify(params));
  return {
    allDishes: dishes,
    dishes: pagination.pagedItems,
    pagination,
    suggestions,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
  };
}
