import { useState } from 'react';
import { useSearchFriends } from '@hatohui/models';
import { useDebouncedValue } from '@hatohui/libs';
import {
  CONNECTIONS_SEARCH_DEBOUNCE_MS,
  CONNECTIONS_PAGE_SIZE,
} from '../constants/onboarding-search';

export function useConnectionsSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(
    query,
    CONNECTIONS_SEARCH_DEBOUNCE_MS,
  );
  const hasQuery = debouncedQuery.trim().length > 0;

  const searchQuery = useSearchFriends(
    { query: debouncedQuery || undefined, page: 1, pageSize: CONNECTIONS_PAGE_SIZE },
    { query: { enabled: hasQuery } },
  );

  return {
    query,
    setQuery,
    items: hasQuery ? (searchQuery.data?.data.items ?? []) : [],
    isLoading: hasQuery && searchQuery.isLoading,
  };
}
