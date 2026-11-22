import type { Prisma } from '@prisma/client';
import type { TravelRecommendationDto } from '@/modules/travel-recommendations/dto/travel-recommendation.dto';
import {
  toTravelCreatorDto,
  travelCreatorSelect,
} from '@/modules/travel-recommendations/utils/travel-creator';
import {
  toTravelPlaceAreaDto,
  travelPlaceAreaSelect,
} from '@/modules/travel-recommendations/utils/travel-place-area';

export const travelCuisineNamesSelect = {
  orderBy: { name: 'asc' },
  select: { name: true },
} satisfies Prisma.TravelDish$cuisinesArgs;

export const travelRecommendationInclude = {
  dish: {
    select: {
      id: true,
      name: true,
      imageKey: true,
      thumbnailKey: true,
      previewKey: true,
      cuisines: travelCuisineNamesSelect,
    },
  },
  place: {
    select: {
      id: true,
      name: true,
      area: travelPlaceAreaSelect,
      address: true,
      city: true,
      mapsUrl: true,
      latitude: true,
      longitude: true,
    },
  },
  images: {
    orderBy: { position: 'asc' },
    select: {
      key: true,
      thumbnailKey: true,
      previewKey: true,
      createdById: true,
    },
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
  const tagsOf = (kind: 'DIET' | 'ALLERGEN' | 'GENERAL') =>
    row.tags.filter((tag) => tag.kind === kind).map((tag) => tag.key);

  return {
    id: row.id,
    dish: {
      id: row.dish.id,
      name: row.dish.name,
      cuisines: row.dish.cuisines.map((cuisine) => cuisine.name),
      imageUrl: row.dish.imageKey ? publicUrlOf(row.dish.imageKey) : null,
      thumbnailUrl: row.dish.thumbnailKey
        ? publicUrlOf(row.dish.thumbnailKey)
        : row.dish.imageKey
          ? publicUrlOf(row.dish.imageKey)
          : null,
      previewUrl: row.dish.previewKey
        ? publicUrlOf(row.dish.previewKey)
        : row.dish.imageKey
          ? publicUrlOf(row.dish.imageKey)
          : null,
    },
    place: { ...row.place, area: toTravelPlaceAreaDto(row.place.area) },
    note: row.note,
    priceMin: row.priceMin,
    priceMax: row.priceMax,
    priceLevel: row.priceLevel,
    currency: row.currency,
    spicy: row.spicy,
    diets: tagsOf('DIET'),
    allergens: tagsOf('ALLERGEN'),
    tags: tagsOf('GENERAL'),
    images: row.images.map(
      ({ key, thumbnailKey, previewKey, createdById }) => ({
        key,
        url: publicUrlOf(key),
        thumbnailUrl: thumbnailKey ? publicUrlOf(thumbnailKey) : null,
        previewUrl: previewKey ? publicUrlOf(previewKey) : null,
        createdById,
      }),
    ),
    createdBy: toTravelCreatorDto(row.createdBy),
    createdAt: row.createdAt,
  };
}
