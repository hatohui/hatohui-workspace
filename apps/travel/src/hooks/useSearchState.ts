import { useState } from 'react';
import { useDebouncedValue } from '@hatohui/libs';
import { SEARCH_DEBOUNCE_MS } from '../constants/travel';

export function useSearchState() {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  return { search, setSearch, query: debounced || undefined };
}
