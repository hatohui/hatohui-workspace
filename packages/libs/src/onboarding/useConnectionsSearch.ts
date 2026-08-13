import { useState } from 'react';
import { useSearchUsers } from '@hatohui/models';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  CONNECTIONS_SEARCH_DEBOUNCE_MS,
  CONNECTIONS_PAGE_SIZE,
} from './onboardingSearch';

export function useConnectionsSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(
    query,
    CONNECTIONS_SEARCH_DEBOUNCE_MS,
  );

  // Connections are between accounts, so this searches accounts — unclaimed
  // directory entries have nobody to send a request to. Empty query browses
  // everyone rather than requiring a typed guess.
  const searchQuery = useSearchUsers({
    query: debouncedQuery.trim() || undefined,
    page: 1,
    pageSize: CONNECTIONS_PAGE_SIZE,
  });

  return {
    query,
    setQuery,
    items: searchQuery.data?.data.items ?? [],
    isLoading: searchQuery.isLoading,
  };
}
