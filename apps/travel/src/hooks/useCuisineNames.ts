import { useTravelCuisines } from '@hatohui/models';

export function useCuisineNames(): string[] {
  const cuisines = useTravelCuisines().data?.data ?? [];
  return cuisines
    .filter((cuisine) => cuisine.dishCount > 0)
    .map((cuisine) => cuisine.name);
}
