import type { Prisma } from '@prisma/client';
import type { TravelRecommendationDto } from '@/modules/travel-recommendations/dto/travel-recommendation.dto';
import {
  toTravelCreatorDto,
  travelCreatorSelect,
} from '@/modules/travel-recommendations/utils/travel-creator';

export const travelRecommendationInclude = {
  dish: { select: { id: true, name: true, cuisine: true } },
  place: {
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      mapsUrl: true,
      latitude: true,
      longitude: true,
    },
  },
  images: {
    orderBy: { position: 'asc' },
    select: { key: true, createdById: true },
  },
  createdBy: { select: travelCreatorSelect },
} satisfies Prisma.TravelRecommendationInclude;

export type TravelRecommendationRow = Prisma.TravelRecommendationGetPayload<{
  include: typeof travelRecommendationInclude;
}>;

export function toTravelRecommendationDto(
  row: TravelRecommendationRow,
  publicUrlOf: (key: string) => string,
): TravelRecommendationDto {
  return {
    id: row.id,
    dish: row.dish,
    place: row.place,
    note: row.note,
    estimate: row.estimate,
    currency: row.currency,
    spicy: row.spicy,
    vegetarian: row.vegetarian,
    images: row.images.map(({ key, createdById }) => ({
      key,
      url: publicUrlOf(key),
      createdById,
    })),
    createdBy: toTravelCreatorDto(row.createdBy),
    createdAt: row.createdAt,
  };
}
