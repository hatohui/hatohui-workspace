import { useTravelDishes } from '@hatohui/models';
import { useSearchState } from './useSearchState';

export function useDishList() {
  const { search, setSearch, query } = useSearchState();
  const result = useTravelDishes({ q: query });
  return {
    dishes: result.data?.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    search,
    setSearch,
  };
}
