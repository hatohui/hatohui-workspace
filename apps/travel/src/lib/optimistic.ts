import type {
  TravelDishDto,
  TravelImageDto,
  TravelPlaceAreaDto,
  TravelPlaceDto,
  TravelRecommendationDto,
  TravelRecommendationsParams,
} from '@hatohui/models';
import type { PhotoItem } from '../hooks/usePhotoList';
import type { RecommendationFields } from '../hooks/useRecommendationFields';

const OPTIMISTIC_PREFIX = 'optimistic:';

export const isOptimisticId = (id: string) => id.startsWith(OPTIMISTIC_PREFIX);

export const createOptimisticId = () =>
  `${OPTIMISTIC_PREFIX}${crypto.randomUUID()}`;

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
      spicy: fields.spicy,
      diets: fields.diets,
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
          imageUrl: dish.coverImageUrl,
          thumbnailUrl: dish.coverImageUrl,
          previewUrl: dish.coverImageUrl,
        }
      : {
          id: `${OPTIMISTIC_PREFIX}dish`,
          name: fields.dishName.trim(),
          cuisines: fields.cuisines,
          imageUrl: null,
          thumbnailUrl: null,
          previewUrl: null,
        },
    place: place
      ? {
          id: place.id,
          name: place.name,
          area: place.area,
          address: place.address,
          city: place.city,
          mapsUrl: place.mapsUrl,
          latitude: place.latitude,
          longitude: place.longitude,
        }
      : {
          id: `${OPTIMISTIC_PREFIX}place`,
          name: fields.placeName.trim(),
          area,
          address: null,
          city: null,
          mapsUrl: fields.mapsUrl || null,
          latitude: null,
          longitude: null,
        },
    note: fields.note || null,
    priceMin: null,
    priceMax: null,
    priceLevel: null,
    currency: fields.currency,
    spicy: fields.spicy,
    diets: fields.diets,
    allergens: fields.allergens,
    tags: fields.tags,
    images,
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
