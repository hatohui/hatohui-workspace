import { useMemo, useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useTravelPlaces, useTravelPlacesPage } from '@hatohui/models';
import { useResponsiveGridCount } from './useResponsiveGridCount';
import type { SearchSuggestion } from './useSearchSuggest';
import type { TravelFilterState } from './useTravelFilterState';
import { useTravelLocation } from './useTravelLocation';

export function usePlaceList(
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
  const [pageState, setPageState] = useState({ key: resetKey, page: 1 });
  const requestedPage = pageState.key === resetKey ? pageState.page : 1;

  const pagedResult = useTravelPlacesPage(
    { ...params, page: requestedPage, pageSize },
    {
      query: {
        enabled: enabled && !groupByCategory,
        placeholderData: keepPreviousData,
      },
    },
  );
  const allResult = useTravelPlaces(params, {
    query: { enabled: enabled && groupByCategory },
  });

  const pagedItems = useMemo(
    () => pagedResult.data?.data.items ?? [],
    [pagedResult.data?.data.items],
  );
  const allPlaces = useMemo(
    () => allResult.data?.data ?? [],
    [allResult.data?.data],
  );
  const totalItems = groupByCategory
    ? allPlaces.length
    : (pagedResult.data?.data.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page =
    totalItems > 0 ? Math.min(requestedPage, totalPages) : requestedPage;

  const setPage = (next: number) => {
    setPageState({ key: resetKey, page: next });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const suggestionSource = groupByCategory ? allPlaces : pagedItems;
  const suggestions = useMemo<SearchSuggestion[]>(
    () =>
      suggestionSource.map((place) => ({
        id: place.id,
        label: place.name,
        sublabel:
          [...place.categories, place.area?.name].filter(Boolean).join(' · ') ||
          null,
        imageUrl: place.coverImageUrl,
      })),
    [suggestionSource],
  );

  const active = groupByCategory ? allResult : pagedResult;
  return {
    allPlaces,
    places: pagedItems,
    pagination: { page, totalItems, totalPages, setPage },
    suggestions,
    isLoading: active.isLoading,
    isError: active.isError,
    refetch: active.refetch,
  };
}
