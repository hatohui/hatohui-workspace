import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useDebouncedValue } from '@hatohui/libs';
import { useTravelEvents, type TravelEventDto } from '@hatohui/models';
import { useTravelLocation } from './useTravelLocation';

export type EventViewMode = 'timeline' | 'calendar' | 'list';

const VALID_VIEWS = new Set<EventViewMode>(['timeline', 'calendar', 'list']);

export function useTravelEventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filter } = useTravelLocation();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);

  const rawView = searchParams.get('view') as EventViewMode | null;
  const view: EventViewMode =
    rawView && VALID_VIEWS.has(rawView) ? rawView : 'timeline';

  const selectedId = searchParams.get('selected');

  const query = useTravelEvents({
    q: debouncedSearch.trim() || undefined,
    ...filter,
  });

  const events = useMemo(() => query.data?.data ?? [], [query.data]);

  const selectedEvent = useMemo<TravelEventDto | null>(
    () =>
      selectedId ? (events.find((e) => e.id === selectedId) ?? null) : null,
    [events, selectedId],
  );

  const setView = useCallback(
    (next: EventViewMode) => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('view', next);
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const selectEvent = useCallback(
    (event: TravelEventDto | null) => {
      const nextParams = new URLSearchParams(searchParams);
      if (event) {
        nextParams.set('selected', event.id);
      } else {
        nextParams.delete('selected');
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return {
    events,
    isLoading: query.isLoading,
    search,
    setSearch,
    view,
    setView,
    selectedEvent,
    selectEvent,
  };
}
