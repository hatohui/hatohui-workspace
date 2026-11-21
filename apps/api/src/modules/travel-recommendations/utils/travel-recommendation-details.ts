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
  dto: UpdateTravelRecommendationDto,
  current: { key: string; kind: 'DIET' | 'ALLERGEN' }[],
): string[] | undefined {
  if (dto.diets === undefined && dto.allergens === undefined) return undefined;
  const keep = (kind: 'DIET' | 'ALLERGEN') =>
    current.filter((tag) => tag.kind === kind).map((tag) => tag.key);
  return [
    ...(dto.diets ?? keep('DIET')),
    ...(dto.allergens ?? keep('ALLERGEN')),
  ];
}
