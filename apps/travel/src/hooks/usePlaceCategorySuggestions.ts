import { useTravelPlaceCategories } from '@hatohui/models';
import type { TagSuggestion } from '@hatohui/ui';

export function usePlaceCategorySuggestions(): TagSuggestion[] {
  const categories = useTravelPlaceCategories().data?.data ?? [];
  return categories.map((category) => ({
    value: category.name,
    hint: String(category.placeCount),
  }));
}
