import type { Prisma } from '@prisma/client';
import type { TravelPlaceAreaDto } from '@/modules/travel-recommendations/dto/travel-recommendation.dto';

export const travelPlaceAreaSelect = {
  select: {
    id: true,
    name: true,
    country: { select: { id: true, name: true } },
  },
} satisfies Prisma.TravelPlace$areaArgs;

type AreaRow = Prisma.TravelAreaGetPayload<typeof travelPlaceAreaSelect>;

export function toTravelPlaceAreaDto(
  area: AreaRow | null,
): TravelPlaceAreaDto | null {
  if (!area) return null;
  return {
    id: area.id,
    name: area.name,
    countryId: area.country.id,
    countryName: area.country.name,
  };
}

export function travelAreaFilter(query: {
  areaId?: string;
  countryId?: string;
}): { areaId: string } | { area: { countryId: string } } | undefined {
  if (query.areaId) return { areaId: query.areaId };
  if (query.countryId) return { area: { countryId: query.countryId } };
  return undefined;
}
