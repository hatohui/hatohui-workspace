import { useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useTravelDishes, useTravelDishesPage } from '@hatohui/models';
import { useCatalogPage } from './useCatalogPage';
import { useResponsiveGridCount } from './useResponsiveGridCount';
import type { SearchSuggestion } from './useSearchSuggest';
import type { TravelFilterState } from './useTravelFilterState';
import { useTravelLocation } from './useTravelLocation';

export function useDishList(
  state: TravelFilterState,
  enabled: boolean,
  groupByCategory: boolean,
) {
  const location = useTravelLocation();
  const pageSize = useResponsiveGridCount('catalog');
  const params = useMemo(
    () => ({ ...state.queryParams, ...location.filter }),
    [location.filter, state.queryParams],
  );
  const resetKey = JSON.stringify({ ...params, pageSize });
  const pageState = useCatalogPage(resetKey);
  const requestedPage = pageState.page;

  const pagedResult = useTravelDishesPage(
    { ...params, page: requestedPage, pageSize },
    {
      query: {
        enabled: enabled && !groupByCategory,
        placeholderData: keepPreviousData,
      },
    },
  );
  const allResult = useTravelDishes(params, {
    query: { enabled: enabled && groupByCategory },
  });

  const pagedItems = useMemo(
    () => pagedResult.data?.data.items ?? [],
    [pagedResult.data?.data.items],
  );
  const allDishes = useMemo(
    () => allResult.data?.data ?? [],
    [allResult.data?.data],
  );
  const totalItems = groupByCategory
    ? allDishes.length
    : (pagedResult.data?.data.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page =
    totalItems > 0 ? Math.min(requestedPage, totalPages) : requestedPage;

  const setPage = (next: number) => {
    pageState.setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const suggestionSource = groupByCategory ? allDishes : pagedItems;
  const suggestions = useMemo<SearchSuggestion[]>(
    () =>
      suggestionSource.map((dish) => ({
        id: dish.id,
        label: dish.name,
        sublabel: [...dish.categories, ...dish.cuisines].join(', ') || null,
        imageUrl: dish.coverImageUrl,
      })),
    [suggestionSource],
  );

  const active = groupByCategory ? allResult : pagedResult;
  return {
    allDishes,
    dishes: pagedItems,
    pagination: { page, totalItems, totalPages, setPage },
    suggestions,
    pageSize,
    isLoading: active.isLoading,
    isError: active.isError,
    refetch: active.refetch,
  };
}
