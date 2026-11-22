import type { Prisma } from '@prisma/client';
import { travelCreatorFilter } from '@/modules/travel-recommendations/utils/travel-creator';
import { travelAreaFilter } from '@/modules/travel-recommendations/utils/travel-place-area';
import type { TravelRecommendationQueryDto } from '@/modules/travel-recommendations/dto/travel-recommendation-query.dto';

const contains = (value: string) => ({
  contains: value,
  mode: 'insensitive' as const,
});

export function travelRecommendationWhere(
  query: TravelRecommendationQueryDto,
): Prisma.TravelRecommendationWhereInput {
  const q = query.q?.trim();
  const and: Prisma.TravelRecommendationWhereInput[] = [
    ...(query.diets ?? []).map((key) => ({ tags: { some: { key } } })),
    ...(query.tags ?? []).map((key) => ({ tags: { some: { key } } })),
  ];
  if (query.excludeAllergens?.length) {
    and.push({ tags: { none: { key: { in: query.excludeAllergens } } } });
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

  return {
    dishId: query.dishId,
    placeId: query.placeId,
    spicy: query.spicy || undefined,
    createdBy: travelCreatorFilter(query.by),
    place: query.city ? { city: contains(query.city) } : undefined,
    AND: and.length ? and : undefined,
    OR: q
      ? [
          { note: contains(q) },
          { dish: { name: contains(q) } },
          { dish: { cuisines: { some: { name: contains(q) } } } },
          { place: { name: contains(q) } },
          { place: { address: contains(q) } },
        ]
      : undefined,
  };
}
