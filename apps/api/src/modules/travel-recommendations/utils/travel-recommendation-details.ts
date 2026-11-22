import type { TravelTagKind } from '@prisma/client';
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
  };
}

export function travelTagKeys(
  resolved: { allergens?: string[]; specials?: string[]; tags?: string[] },
  current: { key: string; kind: TravelTagKind }[],
): string[] | undefined {
  if (
    resolved.allergens === undefined &&
    resolved.specials === undefined &&
    resolved.tags === undefined
  ) {
    return undefined;
  }
  const keep = (kind: TravelTagKind) =>
    current.filter((tag) => tag.kind === kind).map((tag) => tag.key);
  return [
    ...new Set([
      ...(resolved.allergens ?? keep('ALLERGEN')),
      ...(resolved.specials ?? keep('SPECIAL')),
      ...(resolved.tags ?? keep('GENERAL')),
    ]),
  ];
}
