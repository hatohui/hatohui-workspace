import { useState } from 'react';
import { useSearchFriends } from '@hatohui/models';
import { useDebouncedValue } from '@hatohui/libs';
import {
  CONNECTIONS_SEARCH_DEBOUNCE_MS,
  CONNECTIONS_PAGE_SIZE,
} from '../constants/onboarding-search';

export function useConnectionsSearch() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebouncedValue(
    query,
    CONNECTIONS_SEARCH_DEBOUNCE_MS,
  );

  const searchQuery = useSearchFriends({
    query: debouncedQuery || undefined,
    page,
    pageSize: CONNECTIONS_PAGE_SIZE,
  });

  return {
    query,
    setQuery: (value: string) => {
      setQuery(value);
      setPage(1);
    },
    page,
    setPage,
    pageSize: CONNECTIONS_PAGE_SIZE,
    items: searchQuery.data?.data.items ?? [],
    total: searchQuery.data?.data.total ?? 0,
    isLoading: searchQuery.isLoading,
  };
}
