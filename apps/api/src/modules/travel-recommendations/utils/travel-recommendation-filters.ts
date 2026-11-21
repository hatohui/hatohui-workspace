import type { Prisma } from '@prisma/client';
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
  ];
  if (query.excludeAllergens?.length) {
    and.push({ tags: { none: { key: { in: query.excludeAllergens } } } });
  }
  if (query.cuisine) {
    and.push({
      dish: { cuisines: { some: { name: contains(query.cuisine) } } },
    });
  }

  return {
    dishId: query.dishId,
    placeId: query.placeId,
    spiceLevel: query.spicy ? { not: 'NONE' } : undefined,
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
