import type { UpdateTravelRecommendationDto } from '@/modules/travel-recommendations/dto/travel-recommendation-input.dto';

export function travelPriceRange(
  dto: Pick<UpdateTravelRecommendationDto, 'priceMin' | 'priceMax'>,
): { priceMin?: number | null; priceMax?: number | null } {
  if (dto.priceMin === undefined && dto.priceMax === undefined) return {};
  const values = [dto.priceMin, dto.priceMax].filter(
    (value): value is number => typeof value === 'number',
  );
  if (!values.length) return { priceMin: null, priceMax: null };
  return { priceMin: Math.min(...values), priceMax: Math.max(...values) };
}

export function travelRecommendationDetails(
  dto: UpdateTravelRecommendationDto,
) {
  return {
    note: dto.note === undefined ? undefined : dto.note.trim() || null,
    ...travelPriceRange(dto),
    priceLevel: dto.priceLevel,
    currency: dto.currency,
    spicy: dto.spicy,
  };
}

export function travelTagKeys(
  resolved: { diets?: string[]; allergens?: string[]; tags?: string[] },
  current: { key: string; kind: 'DIET' | 'ALLERGEN' | 'GENERAL' }[],
): string[] | undefined {
  if (
    resolved.diets === undefined &&
    resolved.allergens === undefined &&
    resolved.tags === undefined
  ) {
    return undefined;
  }
  const keep = (kind: 'DIET' | 'ALLERGEN' | 'GENERAL') =>
    current.filter((tag) => tag.kind === kind).map((tag) => tag.key);
  return [
    ...new Set([
      ...(resolved.diets ?? keep('DIET')),
      ...(resolved.allergens ?? keep('ALLERGEN')),
      ...(resolved.tags ?? keep('GENERAL')),
    ]),
  ];
}
