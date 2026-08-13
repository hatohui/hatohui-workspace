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
  const hasQuery = debouncedQuery.trim().length > 0;

  // Connections are between accounts, so this searches accounts — unclaimed
  // directory entries have nobody to send a request to.
  const searchQuery = useSearchUsers(
    {
      query: debouncedQuery || undefined,
      page: 1,
      pageSize: CONNECTIONS_PAGE_SIZE,
    },
    { query: { enabled: hasQuery } },
  );

  return {
    query,
    setQuery,
    items: hasQuery ? (searchQuery.data?.data.items ?? []) : [],
    isLoading: hasQuery && searchQuery.isLoading,
  };
}
