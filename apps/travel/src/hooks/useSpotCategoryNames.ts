import { useTravelSpotCategories } from '@hatohui/models';

export function useSpotCategoryNames() {
  const query = useTravelSpotCategories();
  const names = (query.data?.data ?? [])
    .filter((category) => category.spotCount > 0)
    .map((category) => category.name);
  return { names, isLoading: query.isPending };
}
