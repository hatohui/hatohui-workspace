import { useState } from 'react';
import { useDebouncedValue } from '@hatohui/libs';
import {
  SEARCH_DEBOUNCE_MS,
  VIEW_MODE_STORAGE_KEY,
  type GroupOption,
  type SortDirection,
  type ViewMode,
} from '../constants/directoryView';

function readStoredView(): ViewMode {
  const value = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return value === 'timeline' || value === 'calendar' ? value : 'timeline';
}

export function useDirectoryControls() {
  const [view, setViewState] = useState<ViewMode>(readStoredView);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<GroupOption>('month');
  const [direction, setDirection] = useState<SortDirection>('asc');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const setView = (next: ViewMode) => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, next);
    setViewState(next);
  };

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
