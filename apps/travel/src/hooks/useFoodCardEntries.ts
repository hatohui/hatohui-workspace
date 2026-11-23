import { useMemo } from 'react';
import type {
  TravelRecommendationDishDto,
  TravelRecommendationDto,
} from '@hatohui/models';

export interface FoodCardEntry {
  key: string;
  recommendation: TravelRecommendationDto;
  line?: TravelRecommendationDishDto;
}

export function useFoodCardEntries(
  recommendations: TravelRecommendationDto[],
  perDish: boolean,
  focusDishId?: string,
): FoodCardEntry[] {
  return useMemo(() => {
    if (perDish) {
      return recommendations.flatMap((rec) =>
        rec.dishes.map((line) => ({
          key: `${rec.id}:${line.id}`,
          recommendation: rec,
          line,
        })),
      );
    }
    return recommendations.map((rec) => ({
      key: rec.id,
      recommendation: rec,
      line: focusDishId
        ? rec.dishes.find((line) => line.dish.id === focusDishId)
        : undefined,
    }));
  }, [recommendations, perDish, focusDishId]);
}
