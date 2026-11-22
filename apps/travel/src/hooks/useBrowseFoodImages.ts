import { useMemo } from 'react';
import { useTravelDishes } from '@hatohui/models';
import { BROWSE_FOOD_IMAGE_COUNT } from '../constants/food';

export function useBrowseFoodImages() {
  const query = useTravelDishes();
  return useMemo(
    () =>
      (query.data?.data ?? [])
        .map((dish) => dish.coverImageUrl)
        .filter((url): url is string => Boolean(url))
        .slice(0, BROWSE_FOOD_IMAGE_COUNT),
    [query.data?.data],
  );
}
