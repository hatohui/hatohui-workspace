import type { Prisma } from '@prisma/client';
import { travelCreatorFilter } from '@/modules/travel-recommendations/utils/travel-creator';
import { travelAreaFilter } from '@/modules/travel-recommendations/utils/travel-place-area';
import type { TravelRecommendationQueryDto } from '@/modules/travel-recommendations/dto/travel-recommendation-query.dto';

export function travelRecommendationWhere(
  query: TravelRecommendationQueryDto,
): Prisma.TravelRecommendationWhereInput {
  const and: Prisma.TravelRecommendationWhereInput[] = [
    ...(query.tags ?? []).map((key) => ({ tags: { some: { key } } })),
  ];
  const excluded = [
    ...(query.excludeAllergens ?? []),
    ...(query.excludeTags ?? []),
  ];
  if (excluded.length) {
    and.push({ tags: { none: { key: { in: excluded } } } });
  }
  const inArea = travelAreaFilter(query);
  if (inArea) and.push({ place: inArea });
  if (query.cuisines?.length) {
    and.push({
      dish: {
        cuisines: {
          some: {
            OR: query.cuisines.map((name) => ({
              name: { equals: name, mode: 'insensitive' as const },
            })),
          },
        },
      },
    });
  }
  if (query.foodCategories?.length) {
    and.push({
      dish: {
        categories: {
          some: {
            OR: query.foodCategories.map((name) => ({
              name: { equals: name, mode: 'insensitive' as const },
            })),
          },
        },
      },
    });
  }
  if (query.placeCategories?.length) {
    and.push({
      place: {
        categories: {
          some: {
            OR: query.placeCategories.map((name) => ({
              name: { equals: name, mode: 'insensitive' as const },
            })),
          },
        },
      },
    });
  }

  return {
    dishId: query.dishId,
    placeId: query.placeId,
    createdBy: travelCreatorFilter(query.by),
    AND: and.length ? and : undefined,
  };
}
