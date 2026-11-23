import { useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useDebouncedValue } from '@hatohui/libs';
import { useTravelPlaces } from '@hatohui/models';
import { SEARCH_DEBOUNCE_MS } from '../constants/travel';
import { normalizeCatalogName } from '../lib/catalogName';
import type { SearchSuggestion } from './useSearchSuggest';

export function usePlaceSearch(name: string) {
  const term = name.trim();
  const q = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);
  const query = useTravelPlaces(
    { q },
    { query: { enabled: q !== '', placeholderData: keepPreviousData } },
  );
  const places = useMemo(
    () => (q ? (query.data?.data ?? []) : []),
    [q, query.data?.data],
  );

  const suggestions = useMemo<SearchSuggestion[]>(
    () =>
      places.map((p) => ({
        id: p.id,
        label: p.name,
        sublabel: p.area?.name ?? null,
        imageUrl: p.coverImageUrl,
      })),
    [places],
  );

  return {
    suggestions,
    match: places.find(
      (p) => normalizeCatalogName(p.name) === normalizeCatalogName(name),
    ),
    isSearching: term !== '' && (term !== q || query.isFetching),
    findById: (id: string) => places.find((p) => p.id === id) ?? null,
  };
}
