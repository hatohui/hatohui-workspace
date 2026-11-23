import type { Prisma } from '@prisma/client';

export const travelAllergenTagsSelect = {
  orderBy: { position: 'asc' },
  select: { key: true },
} satisfies Prisma.TravelRecommendationDish$allergensArgs;

export function uniqueAllergenKeys(
  dishLines: { allergens: { key: string }[] }[],
): string[] {
  return [
    ...new Set(dishLines.flatMap((line) => line.allergens.map((t) => t.key))),
  ];
}
