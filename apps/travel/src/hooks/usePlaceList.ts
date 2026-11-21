import { useTravelPlaces } from '@hatohui/models';
import { useSearchState } from './useSearchState';

export function usePlaceList() {
  const { search, setSearch, query } = useSearchState();
  const result = useTravelPlaces({ q: query });
  return {
    places: result.data?.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    search,
    setSearch,
  };
}
