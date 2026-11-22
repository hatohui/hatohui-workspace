import { useTravelPlaceCategories } from '@hatohui/models';

export function usePlaceCategoryNames() {
  const query = useTravelPlaceCategories();
  const names = (query.data?.data ?? [])
    .filter((category) => category.placeCount > 0)
    .map((category) => category.name);
  return { names, isLoading: query.isPending };
}
