import type { TravelTagKind } from '@prisma/client';
import type { UpdateTravelRecommendationDto } from '@/modules/travel-recommendations/dto/travel-recommendation-input.dto';

export function travelRecommendationDetails(
  dto: UpdateTravelRecommendationDto,
) {
  return {
    note: dto.note === undefined ? undefined : dto.note.trim() || null,
  };
}

export function travelTagKeys(
  resolved: { specials?: string[]; tags?: string[] },
  current: { key: string; kind: TravelTagKind }[],
): string[] | undefined {
  if (resolved.specials === undefined && resolved.tags === undefined) {
    return undefined;
  }
  const keep = (kind: TravelTagKind) =>
    current.filter((tag) => tag.kind === kind).map((tag) => tag.key);
  return [
    ...new Set([
      ...(resolved.specials ?? keep('SPECIAL')),
      ...(resolved.tags ?? keep('GENERAL')),
    ]),
  ];
}
