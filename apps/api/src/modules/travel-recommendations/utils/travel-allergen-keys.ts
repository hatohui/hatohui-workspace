import { TravelTagKind, type Prisma } from '@prisma/client';

export const travelAllergenTagsSelect = {
  where: { kind: TravelTagKind.ALLERGEN },
  select: { key: true },
} satisfies Prisma.TravelRecommendation$tagsArgs;

export function uniqueAllergenKeys(
  recommendations: { tags: { key: string }[] }[],
): string[] {
  return [
    ...new Set(recommendations.flatMap((rec) => rec.tags.map((t) => t.key))),
  ];
}
