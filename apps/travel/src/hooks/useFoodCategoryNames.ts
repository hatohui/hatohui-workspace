import { useTravelFoodCategories } from '@hatohui/models';

export function useFoodCategoryNames() {
  const query = useTravelFoodCategories();
  const names = (query.data?.data ?? [])
    .filter((category) => category.dishCount > 0)
    .map((category) => category.name);
  return { names, isLoading: query.isPending };
}
