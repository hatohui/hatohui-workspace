import { useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useSearchUsers } from '@hatohui/models';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  CONNECTIONS_SEARCH_DEBOUNCE_MS,
  CONNECTIONS_PAGE_SIZE,
} from './onboardingSearch';

export function useConnectionsSearch() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebouncedValue(
    query,
    CONNECTIONS_SEARCH_DEBOUNCE_MS,
  );

  // Reset to page 1 whenever the search query changes
  const handleSetQuery = (q: string) => {
    setQuery(q);
    setPage(1);
  };

  // Connections are between accounts, so this searches accounts — unclaimed
  // directory entries have nobody to send a request to. Empty query browses
  // everyone rather than requiring a typed guess.
  const searchQuery = useSearchUsers(
    {
      query: debouncedQuery.trim() || undefined,
      page,
      pageSize: CONNECTIONS_PAGE_SIZE,
    },
    // Keeps showing the previous page's results while the next query is in
    // flight, instead of clearing the list back to empty on every keystroke.
    { query: { placeholderData: keepPreviousData } },
  );

  const total = searchQuery.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / CONNECTIONS_PAGE_SIZE));

  return {
    query,
    setQuery: handleSetQuery,
    page,
    setPage,
    totalPages,
    items: searchQuery.data?.data.items ?? [],
    isLoading: searchQuery.isLoading,
  };
}
