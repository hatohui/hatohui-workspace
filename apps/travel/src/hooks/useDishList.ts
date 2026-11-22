import { useMemo } from 'react';
import { useTravelDishes } from '@hatohui/models';
import { usePagination } from './usePagination';
import type { SearchSuggestion } from './useSearchSuggest';
import { useTravelFilterState } from './useTravelFilterState';

export function useDishList() {
  const { queryParams, filters, isFiltered } = useTravelFilterState();
  const result = useTravelDishes(queryParams);
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
  const pagination = usePagination(dishes, JSON.stringify(queryParams));
  return {
    dishes: pagination.pagedItems,
    pagination,
    suggestions,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    filters,
    isFiltered,
  };
}
