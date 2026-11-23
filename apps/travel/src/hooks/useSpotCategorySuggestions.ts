import { useTravelSpotCategories } from '@hatohui/models';
import type { TagSuggestion } from '@hatohui/ui';

export function useSpotCategorySuggestions(): TagSuggestion[] {
  const categories = useTravelSpotCategories().data?.data ?? [];
  return categories.map((category) => ({
    value: category.name,
    hint: String(category.spotCount),
  }));
}
