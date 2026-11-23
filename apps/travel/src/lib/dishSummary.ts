import type { TravelDishDto, TravelDishSummaryDto } from '@hatohui/models';

export const toDishSummary = (dish: TravelDishDto): TravelDishSummaryDto => ({
  id: dish.id,
  name: dish.name,
  cuisines: dish.cuisines,
  categories: dish.categories,
  imageUrl: dish.imageUrl,
  thumbnailUrl: dish.thumbnailUrl,
  previewUrl: dish.previewUrl,
});
