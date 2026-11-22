import { useTravelCuisines } from '@hatohui/models';

export function useCuisineNames() {
  const query = useTravelCuisines();
  const names = (query.data?.data ?? [])
    .filter((cuisine) => cuisine.dishCount > 0)
    .map((cuisine) => cuisine.name);
  return { names, isLoading: query.isPending };
}
