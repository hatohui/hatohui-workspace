import { useState } from 'react';
import { useDebouncedValue } from '@hatohui/libs';
import {
  SEARCH_DEBOUNCE_MS,
  type GroupOption,
  type SortDirection,
  type ViewMode,
} from '../constants/directoryView';

export function useDirectoryControls() {
  const [view, setView] = useState<ViewMode>('timeline');
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<GroupOption>('month');
  const [direction, setDirection] = useState<SortDirection>('asc');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  return {
    view,
    setView,
    search,
    setSearch,
    debouncedSearch,
    group,
    setGroup,
    direction,
    toggleDirection: () =>
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc')),
  };
}
