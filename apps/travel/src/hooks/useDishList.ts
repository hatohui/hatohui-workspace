import { useTravelDishes } from '@hatohui/models';
import { useSearchState } from './useSearchState';
import { useTravelLocation } from './useTravelLocation';

export function useDishList() {
  const { search, setSearch, query } = useSearchState();
  const location = useTravelLocation();
  const result = useTravelDishes({ q: query, ...location.filter });
  return {
    dishes: result.data?.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    search,
    setSearch,
  };
}
