import { useMemo } from 'react';
import { useTravelRecommendations } from '@hatohui/models';
import { usePagination } from './usePagination';
import type { SearchSuggestion } from './useSearchSuggest';
import { useTravelFilterState } from './useTravelFilterState';
import { useTravelLocation } from './useTravelLocation';

export function useCatalog() {
  const { queryParams, filters, isFiltered } = useTravelFilterState();
  const location = useTravelLocation();

  const result = useTravelRecommendations({
    ...queryParams,
    ...location.filter,
  });

  const recommendations = useMemo(
    () => result.data?.data ?? [],
    [result.data?.data],
  );

  const suggestions = useMemo<SearchSuggestion[]>(
    () =>
      recommendations.map((rec) => ({
        id: rec.id,
        label: rec.dish.name,
        sublabel: [rec.place.name, ...rec.dish.cuisines]
          .filter(Boolean)
          .join(' · '),
        imageUrl:
          rec.images[0]?.thumbnailUrl ??
          rec.images[0]?.url ??
          rec.dish.thumbnailUrl ??
          rec.dish.imageUrl ??
          null,
      })),
    [recommendations],
  );

  const resetKey = JSON.stringify({ ...queryParams, ...location.filter });
  const pagination = usePagination(recommendations, resetKey);

  return {
    recommendations: pagination.pagedItems,
    pagination,
    suggestions,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    filters,
    isFiltered,
  };
}

export type CatalogFilters = ReturnType<typeof useCatalog>['filters'];
