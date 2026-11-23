import { useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useTravelSpots, useTravelSpotsPage } from '@hatohui/models';
import { useCatalogPage } from './useCatalogPage';
import { useResponsiveGridCount } from './useResponsiveGridCount';
import type { SearchSuggestion } from './useSearchSuggest';
import type { SpotFilterState } from './useSpotFilterState';
import { useTravelLocation } from './useTravelLocation';

export function useSpotList(state: SpotFilterState, groupByCategory: boolean) {
  const location = useTravelLocation();
  const pageSize = useResponsiveGridCount('catalog');
  const params = useMemo(
    () => ({ ...state.queryParams, ...location.filter }),
    [location.filter, state.queryParams],
  );
  const resetKey = JSON.stringify({ ...params, pageSize });
  const pageState = useCatalogPage(resetKey);
  const requestedPage = pageState.page;

  const pagedResult = useTravelSpotsPage(
    { ...params, page: requestedPage, pageSize },
    {
      query: {
        enabled: !groupByCategory,
        placeholderData: keepPreviousData,
      },
    },
  );
  const allResult = useTravelSpots(params, {
    query: { enabled: groupByCategory },
  });

  const pagedItems = useMemo(
    () => pagedResult.data?.data.items ?? [],
    [pagedResult.data?.data.items],
  );
  const allSpots = useMemo(
    () => allResult.data?.data ?? [],
    [allResult.data?.data],
  );
  const totalItems = groupByCategory
    ? allSpots.length
    : (pagedResult.data?.data.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page =
    totalItems > 0 ? Math.min(requestedPage, totalPages) : requestedPage;

  const setPage = (next: number) => {
    pageState.setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const suggestionSource = groupByCategory ? allSpots : pagedItems;
  const suggestions = useMemo<SearchSuggestion[]>(
    () =>
      suggestionSource.map((spot) => ({
        id: spot.id,
        label: spot.name,
        sublabel:
          [...spot.categories, spot.area?.name].filter(Boolean).join(' · ') ||
          null,
        imageUrl: spot.coverImageUrl,
      })),
    [suggestionSource],
  );

  const active = groupByCategory ? allResult : pagedResult;
  return {
    allSpots,
    spots: pagedItems,
    pageSize,
    pagination: { page, totalItems, totalPages, setPage },
    suggestions,
    isLoading: active.isLoading,
    isError: active.isError,
    refetch: active.refetch,
  };
}
