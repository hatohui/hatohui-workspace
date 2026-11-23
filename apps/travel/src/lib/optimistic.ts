import type {
  TravelDishDto,
  TravelDishSummaryDto,
  TravelDishesParams,
  TravelImageDto,
  TravelPlaceAreaDto,
  TravelPlaceDto,
  TravelRecommendationDto,
  TravelRecommendationsParams,
} from '@hatohui/models';
import { matchesSearch } from '@hatohui/tools';
import type { PhotoItem } from '../hooks/usePhotoList';
import {
  type DishLine,
  type RecommendationFields,
  pickedDishOf,
} from '../hooks/useRecommendationFields';

const OPTIMISTIC_PREFIX = 'optimistic:';

export const isOptimisticId = (id: string) => id.startsWith(OPTIMISTIC_PREFIX);

export const createOptimisticId = () =>
  `${OPTIMISTIC_PREFIX}${crypto.randomUUID()}`;

export function matchesSearchQuery(text: string, q?: string): boolean {
  return matchesSearch(q ?? '', [text]);
}

export function areaMatchesLocation(
  area: TravelPlaceAreaDto | null,
  params?: { areaId?: string; countryId?: string },
): boolean {
  if (!params?.areaId && !params?.countryId) return true;
  if (!area) return false;
  if (params.areaId) return area.id === params.areaId;
  return area.countryId === params.countryId;
}

const toOptimisticImages = (photos: PhotoItem[]): TravelImageDto[] =>
  photos.map((photo) => ({
    key: photo.key ?? photo.id,
    url: photo.url,
    thumbnailUrl: photo.url,
    previewUrl: photo.url,
    createdById: null,
  }));

const dishSummaryOf = (line: DishLine): TravelDishSummaryDto =>
  pickedDishOf(line) ?? {
    id: `${OPTIMISTIC_PREFIX}dish:${line.key}`,
    name: line.name.trim(),
    cuisines: line.cuisines,
    categories: line.foodCategories,
    imageUrl: null,
    thumbnailUrl: null,
    previewUrl: null,
  };

export const visitAllergens = (lines: DishLine[]) => [
  ...new Set(lines.flatMap((line) => line.allergens)),
];

export function buildOptimisticRecommendation(params: {
  id: string;
  existing?: TravelRecommendationDto;
  fields: RecommendationFields;
  lines: DishLine[];
  place?: TravelPlaceDto;
  area?: TravelPlaceAreaDto | null;
  photos: PhotoItem[];
}): TravelRecommendationDto {
  const { id, existing, fields, lines, place, area = null, photos } = params;
  const dishes = lines.map((line) => ({
    id: line.key,
    dish: dishSummaryOf(line),
    priceMin: line.priceMin,
    priceMax: line.priceMax,
    priceLevel: line.priceLevel,
    allergens: line.allergens,
  }));
  const shared = {
    dishes,
    note: fields.note || null,
    currency: fields.currency,
    specials: fields.specials,
    tags: fields.tags,
    images: toOptimisticImages(photos),
  };

  if (existing) {
    return { ...existing, ...shared, place: { ...existing.place, area } };
  }

  return {
    id,
    place: place
      ? {
          id: place.id,
          name: place.name,
          area: place.area,
          categories: place.categories,
          address: place.address,
          mapsUrl: place.mapsUrl,
          latitude: place.latitude,
          longitude: place.longitude,
        }
      : {
          id: `${OPTIMISTIC_PREFIX}place`,
          name: fields.placeName.trim(),
          area,
          categories: fields.placeCategories,
          address: null,
          mapsUrl: fields.mapsUrl || null,
          latitude: null,
          longitude: null,
        },
    ...shared,
    createdBy: null,
    createdAt: new Date().toISOString(),
  };
}

export function buildOptimisticDish(params: {
  id: string;
  line: DishLine;
  area: TravelPlaceAreaDto | null;
  coverImageUrl: string | null;
  queryParams?: TravelDishesParams;
}): TravelDishDto {
  const { id, line, area, coverImageUrl, queryParams } = params;
  const hasLocation = Boolean(queryParams?.areaId || queryParams?.countryId);
  const localPlaceCount = hasLocation
    ? areaMatchesLocation(area, queryParams)
      ? 1
      : 0
    : null;

  return {
    id,
    name: line.name.trim(),
    cuisines: line.cuisines,
    categories: line.foodCategories,
    description: null,
    allergens: line.allergens,
    placeCount: 1,
    localPlaceCount,
    imageKey: null,
    imageUrl: coverImageUrl,
    thumbnailUrl: coverImageUrl,
    previewUrl: coverImageUrl,
    coverImageUrl,
    createdBy: null,
    createdAt: new Date().toISOString(),
  };
}

export function buildOptimisticPlace(params: {
  id: string;
  fields: RecommendationFields;
  lines: DishLine[];
  area: TravelPlaceAreaDto | null;
  coverImageUrl: string | null;
}): TravelPlaceDto {
  const { id, fields, lines, area, coverImageUrl } = params;
  return {
    id,
    name: fields.placeName.trim(),
    area,
    categories: fields.placeCategories,
    address: null,
    mapsUrl: fields.mapsUrl || null,
    latitude: null,
    longitude: null,
    note: null,
    allergens: visitAllergens(lines),
    dishCount: lines.length,
    coverImageUrl,
    createdBy: null,
    createdAt: new Date().toISOString(),
  };
}

export function shouldPrependToQuery(
  queryKey: readonly unknown[],
  dishIds: string[],
  placeId?: string,
): boolean {
  const params = queryKey[1] as TravelRecommendationsParams | undefined;
  if (!params) return true;
  if (params.dishId && !dishIds.includes(params.dishId)) return false;
  if (params.placeId && params.placeId !== placeId) return false;
  return true;
}
