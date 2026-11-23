import type { Prisma, TravelTagKind } from '@prisma/client';
import type {
  TravelDishSummaryDto,
  TravelRecommendationDto,
} from '@/modules/travel-recommendations/dto/travel-recommendation.dto';
import { travelAllergenTagsSelect } from '@/modules/travel-recommendations/utils/travel-allergen-keys';
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

export const travelFoodCategoryNamesSelect = {
  orderBy: { name: 'asc' },
  select: { name: true },
} satisfies Prisma.TravelDish$categoriesArgs;

export const travelPlaceCategoryNamesSelect = {
  orderBy: { name: 'asc' },
  select: { name: true },
} satisfies Prisma.TravelPlace$categoriesArgs;

const travelDishSummarySelect = {
  id: true,
  name: true,
  imageKey: true,
  thumbnailKey: true,
  previewKey: true,
  cuisines: travelCuisineNamesSelect,
  categories: travelFoodCategoryNamesSelect,
} satisfies Prisma.TravelDishSelect;

type TravelDishSummaryRow = Prisma.TravelDishGetPayload<{
  select: typeof travelDishSummarySelect;
}>;

export const travelRecommendationInclude = {
  dishes: {
    orderBy: { position: 'asc' },
    select: {
      id: true,
      dish: { select: travelDishSummarySelect },
      allergens: travelAllergenTagsSelect,
    },
  },
  place: {
    select: {
      id: true,
      name: true,
      area: travelPlaceAreaSelect,
      categories: travelPlaceCategoryNamesSelect,
      address: true,
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

function toDishSummaryDto(
  dish: TravelDishSummaryRow,
  publicUrlOf: (key: string) => string,
): TravelDishSummaryDto {
  const imageUrl = dish.imageKey ? publicUrlOf(dish.imageKey) : null;
  return {
    id: dish.id,
    name: dish.name,
    cuisines: dish.cuisines.map((cuisine) => cuisine.name),
    categories: dish.categories.map((category) => category.name),
    imageUrl,
    thumbnailUrl: dish.thumbnailKey ? publicUrlOf(dish.thumbnailKey) : imageUrl,
    previewUrl: dish.previewKey ? publicUrlOf(dish.previewKey) : imageUrl,
  };
}

export function toTravelRecommendationDto(
  row: TravelRecommendationRow,
  publicUrlOf: (key: string) => string,
): TravelRecommendationDto {
  const tagsOf = (kind: TravelTagKind) =>
    row.tags.filter((tag) => tag.kind === kind).map((tag) => tag.key);

  return {
    id: row.id,
    place: {
      ...row.place,
      categories: row.place.categories.map((category) => category.name),
      area: toTravelPlaceAreaDto(row.place.area),
    },
    dishes: row.dishes.map((line) => ({
      id: line.id,
      dish: toDishSummaryDto(line.dish, publicUrlOf),
      allergens: line.allergens.map((tag) => tag.key),
    })),
    note: row.note,
    specials: tagsOf('SPECIAL'),
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
