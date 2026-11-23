import type { Prisma } from '@prisma/client';
import { travelCreatorFilter } from '@/modules/travel-recommendations/utils/travel-creator';
import { travelAreaFilter } from '@/modules/travel-recommendations/utils/travel-place-area';
import type { TravelRecommendationQueryDto } from '@/modules/travel-recommendations/dto/travel-recommendation-query.dto';

const namedAny = (names: string[]) => ({
  some: {
    OR: names.map((name) => ({
      name: { equals: name, mode: 'insensitive' as const },
    })),
  },
});

export function travelRecommendationWhere(
  query: TravelRecommendationQueryDto,
): Prisma.TravelRecommendationWhereInput {
  const and: Prisma.TravelRecommendationWhereInput[] = [
    ...(query.tags ?? []).map((key) => ({ tags: { some: { key } } })),
  ];
  if (query.excludeTags?.length) {
    and.push({ tags: { none: { key: { in: query.excludeTags } } } });
  }
  if (query.excludeAllergens?.length) {
    and.push({
      dishes: {
        some: {
          allergens: { none: { key: { in: query.excludeAllergens } } },
        },
      },
    });
  }
  if (query.dishId) and.push({ dishes: { some: { dishId: query.dishId } } });
  const inArea = travelAreaFilter(query);
  if (inArea) and.push({ place: inArea });
  if (query.cuisines?.length) {
    and.push({
      dishes: { some: { dish: { cuisines: namedAny(query.cuisines) } } },
    });
  }
  if (query.foodCategories?.length) {
    and.push({
      dishes: {
        some: { dish: { categories: namedAny(query.foodCategories) } },
      },
    });
  }
  if (query.placeCategories?.length) {
    and.push({ place: { categories: namedAny(query.placeCategories) } });
  }

  return {
    placeId: query.placeId,
    createdBy: travelCreatorFilter(query.by),
    AND: and.length ? and : undefined,
  };
}
