import type { TravelRecommendationDto } from '@hatohui/models';

export const visitDishNames = (rec: TravelRecommendationDto) =>
  rec.dishes.map((line) => line.dish.name).join(', ');

export const visitAllergenKeys = (rec: TravelRecommendationDto) => [
  ...new Set(rec.dishes.flatMap((line) => line.allergens)),
];
