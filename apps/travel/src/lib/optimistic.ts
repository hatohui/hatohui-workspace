import type {
  TravelDishDto,
  TravelDishesParams,
  TravelImageDto,
  TravelPlaceAreaDto,
  TravelPlaceDto,
  TravelRecommendationDto,
  TravelRecommendationsParams,
} from '@hatohui/models';
import { matchesSearch } from '@hatohui/tools';
import type { PhotoItem } from '../hooks/usePhotoList';
import type { RecommendationFields } from '../hooks/useRecommendationFields';

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

export function buildOptimisticRecommendation(params: {
  id: string;
  existing?: TravelRecommendationDto;
  fields: RecommendationFields;
  dish?: TravelDishDto;
  place?: TravelPlaceDto;
  area?: TravelPlaceAreaDto | null;
  photos: PhotoItem[];
}): TravelRecommendationDto {
  const { id, existing, fields, dish, place, area = null, photos } = params;
  const images = toOptimisticImages(photos);

  if (existing) {
    return {
      ...existing,
      place: {
        ...existing.place,
        area,
      },
      note: fields.note || null,
      specials: fields.specials,
      allergens: fields.allergens,
      tags: fields.tags,
      images,
    };
  }

  return {
    id,
    dish: dish
      ? {
          id: dish.id,
          name: dish.name,
          cuisines: dish.cuisines,
          categories: dish.categories,
          imageUrl: dish.coverImageUrl,
          thumbnailUrl: dish.coverImageUrl,
          previewUrl: dish.coverImageUrl,
        }
      : {
          id: `${OPTIMISTIC_PREFIX}dish`,
          name: fields.dishName.trim(),
          cuisines: fields.cuisines,
          categories: fields.foodCategories,
          imageUrl: null,
          thumbnailUrl: null,
          previewUrl: null,
        },
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
    note: fields.note || null,
    priceMin: null,
    priceMax: null,
    priceLevel: null,
    currency: fields.currency,
    specials: fields.specials,
    allergens: fields.allergens,
    tags: fields.tags,
    images,
    createdBy: null,
    createdAt: new Date().toISOString(),
  };
}

export function buildOptimisticDish(params: {
  id: string;
  fields: RecommendationFields;
  area: TravelPlaceAreaDto | null;
  coverImageUrl: string | null;
  queryParams?: TravelDishesParams;
}): TravelDishDto {
  const { id, fields, area, coverImageUrl, queryParams } = params;
  const hasLocation = Boolean(queryParams?.areaId || queryParams?.countryId);
  const localPlaceCount = hasLocation
    ? areaMatchesLocation(area, queryParams)
      ? 1
      : 0
    : null;

  return {
    id,
    name: fields.dishName.trim(),
    cuisines: fields.cuisines,
    categories: fields.foodCategories,
    description: null,
    allergens: fields.allergens,
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
  area: TravelPlaceAreaDto | null;
  coverImageUrl: string | null;
}): TravelPlaceDto {
  const { id, fields, area, coverImageUrl } = params;
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
    allergens: fields.allergens,
    dishCount: 1,
    coverImageUrl,
    createdBy: null,
    createdAt: new Date().toISOString(),
  };
}

export function shouldPrependToQuery(
  queryKey: readonly unknown[],
  dishId?: string,
  placeId?: string,
): boolean {
  const params = queryKey[1] as TravelRecommendationsParams | undefined;
  if (!params) return true;
  if (params.dishId && params.dishId !== dishId) return false;
  if (params.placeId && params.placeId !== placeId) return false;
  return true;
}
