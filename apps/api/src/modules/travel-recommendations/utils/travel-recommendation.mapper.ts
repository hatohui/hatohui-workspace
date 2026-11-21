import type { Prisma } from '@prisma/client';
import type { TravelRecommendationDto } from '@/modules/travel-recommendations/dto/travel-recommendation.dto';
import type {
  TravelAllergenTag,
  TravelDietTag,
} from '@/modules/travel-recommendations/travel-recommendations.constants';
import {
  toTravelCreatorDto,
  travelCreatorSelect,
} from '@/modules/travel-recommendations/utils/travel-creator';

export const travelCuisineNamesSelect = {
  orderBy: { name: 'asc' },
  select: { name: true },
} satisfies Prisma.TravelDish$cuisinesArgs;

export const travelRecommendationInclude = {
  dish: {
    select: { id: true, name: true, cuisines: travelCuisineNamesSelect },
  },
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
  tags: {
    orderBy: { position: 'asc' },
    select: { key: true, kind: true },
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
  const tagsOf = (kind: 'DIET' | 'ALLERGEN') =>
    row.tags.filter((tag) => tag.kind === kind).map((tag) => tag.key);

  return {
    id: row.id,
    dish: {
      id: row.dish.id,
      name: row.dish.name,
      cuisines: row.dish.cuisines.map((cuisine) => cuisine.name),
    },
    place: row.place,
    note: row.note,
    priceMin: row.priceMin,
    priceMax: row.priceMax,
    priceLevel: row.priceLevel,
    currency: row.currency,
    spicy: row.spicy,
    diets: tagsOf('DIET') as TravelDietTag[],
    allergens: tagsOf('ALLERGEN') as TravelAllergenTag[],
    images: row.images.map(({ key, createdById }) => ({
      key,
      url: publicUrlOf(key),
      createdById,
    })),
    createdBy: toTravelCreatorDto(row.createdBy),
    createdAt: row.createdAt,
  };
}
