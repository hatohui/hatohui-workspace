import type { TravelRecommendationDto } from '@hatohui/models';

export const recommendationDishNames = (rec: TravelRecommendationDto) =>
  rec.dishes.map((line) => line.dish.name).join(', ');

export const recommendationAllergenKeys = (rec: TravelRecommendationDto) => [
  ...new Set(rec.dishes.flatMap((line) => line.allergens)),
];
