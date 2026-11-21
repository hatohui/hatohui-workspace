import { useTravelCuisines } from '@hatohui/models';
import type { TagSuggestion } from '@hatohui/ui';

export function useCuisineSuggestions(): TagSuggestion[] {
  const cuisines = useTravelCuisines().data?.data ?? [];
  return cuisines.map((cuisine) => ({
    value: cuisine.name,
    hint: String(cuisine.dishCount),
  }));
}
