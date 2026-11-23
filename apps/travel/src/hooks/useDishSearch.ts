import { useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useDebouncedValue } from '@hatohui/libs';
import { useTravelDishes } from '@hatohui/models';
import { SEARCH_DEBOUNCE_MS } from '../constants/travel';
import { normalizeCatalogName } from '../lib/catalogName';
import type { SearchSuggestion } from './useSearchSuggest';

export function useDishSearch(name: string) {
  const term = name.trim();
  const q = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);
  const query = useTravelDishes(
    { q },
    { query: { enabled: q !== '', placeholderData: keepPreviousData } },
  );
  const dishes = useMemo(
    () => (q ? (query.data?.data ?? []) : []),
    [q, query.data?.data],
  );

  const suggestions = useMemo<SearchSuggestion[]>(
    () =>
      dishes.map((d) => ({
        id: d.id,
        label: d.name,
        sublabel: d.cuisines.join(', ') || null,
        imageUrl: d.coverImageUrl,
      })),
    [dishes],
  );

  return {
    suggestions,
    match: dishes.find(
      (d) => normalizeCatalogName(d.name) === normalizeCatalogName(name),
    ),
    isSearching: term !== '' && (term !== q || query.isFetching),
    findById: (id: string) => dishes.find((d) => d.id === id) ?? null,
  };
}
