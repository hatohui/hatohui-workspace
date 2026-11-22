import { useTravelFoodCategories } from '@hatohui/models';
import type { TagSuggestion } from '@hatohui/ui';

export function useFoodCategorySuggestions(): TagSuggestion[] {
  const categories = useTravelFoodCategories().data?.data ?? [];
  return categories.map((category) => ({
    value: category.name,
    hint: String(category.dishCount),
  }));
}
