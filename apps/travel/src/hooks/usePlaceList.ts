import { useTravelPlaces } from '@hatohui/models';
import { useSearchState } from './useSearchState';
import { useTravelLocation } from './useTravelLocation';

export function usePlaceList() {
  const { search, setSearch, query } = useSearchState();
  const location = useTravelLocation();
  const result = useTravelPlaces({ q: query, ...location.filter });
  return {
    places: result.data?.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    search,
    setSearch,
  };
}
