import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import {
  getTravelDishQueryKey,
  getTravelDishesPageQueryKey,
  getTravelDishesQueryKey,
  getTravelPlaceQueryKey,
  getTravelPlacesPageQueryKey,
  getTravelPlacesQueryKey,
  getTravelRecommendationsQueryKey,
  type PaginatedTravelDishesDto,
  type PaginatedTravelPlacesDto,
  type TravelDishDetailDto,
  type TravelDishDto,
  type TravelDishesPageParams,
  type TravelDishesParams,
  type TravelPlaceAreaDto,
  type TravelPlaceDetailDto,
  type TravelPlaceDto,
  type TravelPlacesPageParams,
  type TravelPlacesParams,
  type TravelRecommendationDto,
} from '@hatohui/models';
import {
  areaMatchesLocation,
  buildOptimisticDish,
  buildOptimisticPlace,
  buildOptimisticRecommendation,
  createOptimisticId,
  matchesSearchQuery,
  shouldPrependToQuery,
} from '../lib/optimistic';
import type { PhotoItem } from './usePhotoList';
import type { RecommendationFields } from './useRecommendationFields';

interface Envelope<T> {
  data: T;
}

interface ApplyParams {
  existing?: TravelRecommendationDto;
  fields: RecommendationFields;
  dish?: TravelDishDto;
  place?: TravelPlaceDto;
  area: TravelPlaceAreaDto | null;
  photos: PhotoItem[];
}

const mergeStrings = (current: string[], added: string[]) => [
  ...new Set([...current, ...added]),
];

const patchExistingDish = (
  item: TravelDishDto,
  dishId: string,
  allergens: string[],
  coverImageUrl: string | null,
  area: TravelPlaceAreaDto | null,
  queryParams?: TravelDishesParams,
): TravelDishDto =>
  item.id === dishId
    ? {
        ...item,
        placeCount: item.placeCount + 1,
        localPlaceCount:
          item.localPlaceCount === null
            ? null
            : item.localPlaceCount +
              (areaMatchesLocation(area, queryParams) ? 1 : 0),
        allergens: mergeStrings(item.allergens, allergens),
        coverImageUrl: item.coverImageUrl ?? coverImageUrl,
      }
    : item;

const patchExistingPlace = (
  item: TravelPlaceDto,
  placeId: string,
  allergens: string[],
  coverImageUrl: string | null,
): TravelPlaceDto =>
  item.id === placeId
    ? {
        ...item,
        dishCount: item.dishCount + 1,
        allergens: mergeStrings(item.allergens, allergens),
        coverImageUrl: item.coverImageUrl ?? coverImageUrl,
      }
    : item;

const settleDishItem = (
  item: TravelDishDto,
  tempDishId: string,
  saved: TravelRecommendationDto,
  savedCover: string | null,
): TravelDishDto =>
  item.id === tempDishId
    ? {
        ...item,
        id: saved.dish.id,
        name: saved.dish.name,
        cuisines: saved.dish.cuisines,
        categories: saved.dish.categories,
        imageUrl: saved.dish.imageUrl,
        thumbnailUrl: saved.dish.thumbnailUrl,
        previewUrl: saved.dish.previewUrl,
        coverImageUrl:
          saved.dish.thumbnailUrl ??
          saved.dish.imageUrl ??
          savedCover ??
          item.coverImageUrl,
      }
    : item;

const settlePlaceItem = (
  item: TravelPlaceDto,
  tempPlaceId: string,
  saved: TravelRecommendationDto,
  savedCover: string | null,
): TravelPlaceDto =>
  item.id === tempPlaceId
    ? {
        ...item,
        id: saved.place.id,
        name: saved.place.name,
        area: saved.place.area,
        categories: saved.place.categories,
        address: saved.place.address,
        mapsUrl: saved.place.mapsUrl,
        latitude: saved.place.latitude,
        longitude: saved.place.longitude,
        coverImageUrl: savedCover ?? item.coverImageUrl,
      }
    : item;

export function useOptimisticRecommendation() {
  const queryClient = useQueryClient();

  const apply = (params: ApplyParams) => {
    const { existing, fields, dish, place, area, photos } = params;
    const tempId = existing?.id ?? createOptimisticId();
    const tempDishId = createOptimisticId();
    const tempPlaceId = createOptimisticId();
    const coverImageUrl = photos[0]?.url ?? null;

    const optimistic = buildOptimisticRecommendation({
      id: tempId,
      existing,
      fields,
      dish,
      place,
      area,
      photos,
    });

    const recKey = getTravelRecommendationsQueryKey();
    const dishesKey = getTravelDishesQueryKey();
    const dishPageKey = getTravelDishesPageQueryKey();
    const placesKey = getTravelPlacesQueryKey();
    const placePageKey = getTravelPlacesPageQueryKey();
    const dishId = dish?.id ?? existing?.dish.id;
    const placeId = place?.id ?? existing?.place.id;
    const dishDetailKey = dishId ? getTravelDishQueryKey(dishId) : null;
    const placeDetailKey = placeId ? getTravelPlaceQueryKey(placeId) : null;

    const recSnapshots = queryClient.getQueriesData<
      Envelope<TravelRecommendationDto[]>
    >({ queryKey: recKey });
    const dishesSnapshots = queryClient.getQueriesData<
      Envelope<TravelDishDto[]>
    >({ queryKey: dishesKey });
    const dishPageSnapshots = queryClient.getQueriesData<
      Envelope<PaginatedTravelDishesDto>
    >({ queryKey: dishPageKey });
    const placesSnapshots = queryClient.getQueriesData<
      Envelope<TravelPlaceDto[]>
    >({ queryKey: placesKey });
    const placePageSnapshots = queryClient.getQueriesData<
      Envelope<PaginatedTravelPlacesDto>
    >({ queryKey: placePageKey });
    const dishDetailSnapshots = dishDetailKey
      ? queryClient.getQueriesData<Envelope<TravelDishDetailDto>>({
          queryKey: dishDetailKey,
        })
      : [];
    const placeDetailSnapshots = placeDetailKey
      ? queryClient.getQueriesData<Envelope<TravelPlaceDetailDto>>({
          queryKey: placeDetailKey,
        })
      : [];

    void queryClient.cancelQueries({ queryKey: recKey });
    void queryClient.cancelQueries({ queryKey: dishesKey });
    void queryClient.cancelQueries({ queryKey: dishPageKey });
    void queryClient.cancelQueries({ queryKey: placesKey });
    void queryClient.cancelQueries({ queryKey: placePageKey });
    if (dishDetailKey) {
      void queryClient.cancelQueries({ queryKey: dishDetailKey });
    }
    if (placeDetailKey) {
      void queryClient.cancelQueries({ queryKey: placeDetailKey });
    }

    for (const [key, current] of recSnapshots) {
      if (!current?.data) continue;
      if (existing) {
        queryClient.setQueryData<Envelope<TravelRecommendationDto[]>>(key, {
          ...current,
          data: current.data.map((item) =>
            item.id === existing.id ? optimistic : item,
          ),
        });
      } else if (shouldPrependToQuery(key, dish?.id, place?.id)) {
        queryClient.setQueryData<Envelope<TravelRecommendationDto[]>>(key, {
          ...current,
          data: [optimistic, ...current.data],
        });
      }
    }

    for (const [key, current] of dishDetailSnapshots) {
      if (!current?.data) continue;
      queryClient.setQueryData<Envelope<TravelDishDetailDto>>(key, {
        ...current,
        data: existing
          ? {
              ...current.data,
              recommendations: current.data.recommendations.map((item) =>
                item.id === existing.id ? optimistic : item,
              ),
            }
          : {
              ...current.data,
              placeCount: current.data.placeCount + 1,
              allergens: mergeStrings(current.data.allergens, fields.allergens),
              recommendations: [optimistic, ...current.data.recommendations],
            },
      });
    }

    for (const [key, current] of placeDetailSnapshots) {
      if (!current?.data) continue;
      queryClient.setQueryData<Envelope<TravelPlaceDetailDto>>(key, {
        ...current,
        data: existing
          ? {
              ...current.data,
              recommendations: current.data.recommendations.map((item) =>
                item.id === existing.id ? optimistic : item,
              ),
            }
          : {
              ...current.data,
              dishCount: current.data.dishCount + 1,
              allergens: mergeStrings(current.data.allergens, fields.allergens),
              recommendations: [optimistic, ...current.data.recommendations],
            },
      });
    }

    if (!existing) {
      for (const [key, current] of dishesSnapshots) {
        if (!Array.isArray(current?.data)) continue;
        const queryParams = key[1] as TravelDishesParams | undefined;
        if (dish) {
          queryClient.setQueryData<Envelope<TravelDishDto[]>>(key, {
            ...current,
            data: current.data.map((item) =>
              patchExistingDish(
                item,
                dish.id,
                fields.allergens,
                coverImageUrl,
                area,
                queryParams,
              ),
            ),
          });
        } else if (matchesSearchQuery(fields.dishName, queryParams?.q)) {
          const optimisticDish = buildOptimisticDish({
            id: tempDishId,
            fields,
            area,
            coverImageUrl,
            queryParams,
          });
          queryClient.setQueryData<Envelope<TravelDishDto[]>>(key, {
            ...current,
            data: [optimisticDish, ...current.data],
          });
        }
      }

      for (const [key, current] of dishPageSnapshots) {
        if (!Array.isArray(current?.data?.items)) continue;
        const queryParams = key[1] as TravelDishesPageParams | undefined;
        if (dish) {
          queryClient.setQueryData<Envelope<PaginatedTravelDishesDto>>(key, {
            ...current,
            data: {
              ...current.data,
              items: current.data.items.map((item) =>
                patchExistingDish(
                  item,
                  dish.id,
                  fields.allergens,
                  coverImageUrl,
                  area,
                  queryParams,
                ),
              ),
            },
          });
        } else if (
          (queryParams?.page ?? 1) === 1 &&
          matchesSearchQuery(fields.dishName, queryParams?.q)
        ) {
          const optimisticDish = buildOptimisticDish({
            id: tempDishId,
            fields,
            area,
            coverImageUrl,
            queryParams,
          });
          const nextTotal = current.data.total + 1;
          queryClient.setQueryData<Envelope<PaginatedTravelDishesDto>>(key, {
            ...current,
            data: {
              ...current.data,
              items: [optimisticDish, ...current.data.items].slice(
                0,
                current.data.pageSize,
              ),
              total: nextTotal,
              hasMore: nextTotal > current.data.page * current.data.pageSize,
            },
          });
        }
      }

      for (const [key, current] of placesSnapshots) {
        if (!Array.isArray(current?.data)) continue;
        const queryParams = key[1] as TravelPlacesParams | undefined;
        if (place) {
          queryClient.setQueryData<Envelope<TravelPlaceDto[]>>(key, {
            ...current,
            data: current.data.map((item) =>
              patchExistingPlace(
                item,
                place.id,
                fields.allergens,
                coverImageUrl,
              ),
            ),
          });
        } else if (
          matchesSearchQuery(fields.placeName, queryParams?.q) &&
          areaMatchesLocation(area, queryParams)
        ) {
          const optimisticPlace = buildOptimisticPlace({
            id: tempPlaceId,
            fields,
            area,
            coverImageUrl,
          });
          queryClient.setQueryData<Envelope<TravelPlaceDto[]>>(key, {
            ...current,
            data: [optimisticPlace, ...current.data],
          });
        }
      }

      for (const [key, current] of placePageSnapshots) {
        if (!Array.isArray(current?.data?.items)) continue;
        const queryParams = key[1] as TravelPlacesPageParams | undefined;
        if (place) {
          queryClient.setQueryData<Envelope<PaginatedTravelPlacesDto>>(key, {
            ...current,
            data: {
              ...current.data,
              items: current.data.items.map((item) =>
                patchExistingPlace(
                  item,
                  place.id,
                  fields.allergens,
                  coverImageUrl,
                ),
              ),
            },
          });
        } else if (
          (queryParams?.page ?? 1) === 1 &&
          matchesSearchQuery(fields.placeName, queryParams?.q) &&
          areaMatchesLocation(area, queryParams)
        ) {
          const optimisticPlace = buildOptimisticPlace({
            id: tempPlaceId,
            fields,
            area,
            coverImageUrl,
          });
          const nextTotal = current.data.total + 1;
          queryClient.setQueryData<Envelope<PaginatedTravelPlacesDto>>(key, {
            ...current,
            data: {
              ...current.data,
              items: [optimisticPlace, ...current.data.items].slice(
                0,
                current.data.pageSize,
              ),
              total: nextTotal,
              hasMore: nextTotal > current.data.page * current.data.pageSize,
            },
          });
        }
      }
    }

    const settle = (saved: TravelRecommendationDto) => {
      const savedCover =
        saved.images[0]?.thumbnailUrl ?? saved.images[0]?.url ?? null;

      for (const [key, current] of queryClient.getQueriesData<
        Envelope<TravelRecommendationDto[]>
      >({ queryKey: recKey })) {
        if (!current?.data) continue;
        queryClient.setQueryData<Envelope<TravelRecommendationDto[]>>(key, {
          ...current,
          data: current.data.map((item) => (item.id === tempId ? saved : item)),
        });
      }

      if (dishDetailKey) {
        for (const [key, current] of queryClient.getQueriesData<
          Envelope<TravelDishDetailDto>
        >({ queryKey: dishDetailKey })) {
          if (!current?.data) continue;
          queryClient.setQueryData<Envelope<TravelDishDetailDto>>(key, {
            ...current,
            data: {
              ...current.data,
              recommendations: current.data.recommendations.map((item) =>
                item.id === tempId ? saved : item,
              ),
            },
          });
        }
      }

      if (placeDetailKey) {
        for (const [key, current] of queryClient.getQueriesData<
          Envelope<TravelPlaceDetailDto>
        >({ queryKey: placeDetailKey })) {
          if (!current?.data) continue;
          queryClient.setQueryData<Envelope<TravelPlaceDetailDto>>(key, {
            ...current,
            data: {
              ...current.data,
              recommendations: current.data.recommendations.map((item) =>
                item.id === tempId ? saved : item,
              ),
            },
          });
        }
      }

      for (const [key, current] of queryClient.getQueriesData<
        Envelope<TravelDishDto[]>
      >({ queryKey: dishesKey })) {
        if (!Array.isArray(current?.data)) continue;
        queryClient.setQueryData<Envelope<TravelDishDto[]>>(key, {
          ...current,
          data: current.data.map((item) =>
            settleDishItem(item, tempDishId, saved, savedCover),
          ),
        });
      }

      for (const [key, current] of queryClient.getQueriesData<
        Envelope<PaginatedTravelDishesDto>
      >({ queryKey: dishPageKey })) {
        if (!Array.isArray(current?.data?.items)) continue;
        queryClient.setQueryData<Envelope<PaginatedTravelDishesDto>>(key, {
          ...current,
          data: {
            ...current.data,
            items: current.data.items.map((item) =>
              settleDishItem(item, tempDishId, saved, savedCover),
            ),
          },
        });
      }

      for (const [key, current] of queryClient.getQueriesData<
        Envelope<TravelPlaceDto[]>
      >({ queryKey: placesKey })) {
        if (!Array.isArray(current?.data)) continue;
        queryClient.setQueryData<Envelope<TravelPlaceDto[]>>(key, {
          ...current,
          data: current.data.map((item) =>
            settlePlaceItem(item, tempPlaceId, saved, savedCover),
          ),
        });
      }

      for (const [key, current] of queryClient.getQueriesData<
        Envelope<PaginatedTravelPlacesDto>
      >({ queryKey: placePageKey })) {
        if (!Array.isArray(current?.data?.items)) continue;
        queryClient.setQueryData<Envelope<PaginatedTravelPlacesDto>>(key, {
          ...current,
          data: {
            ...current.data,
            items: current.data.items.map((item) =>
              settlePlaceItem(item, tempPlaceId, saved, savedCover),
            ),
          },
        });
      }
    };

    const rollback = () => {
      const allSnapshots: Array<[QueryKey, unknown]> = [
        ...recSnapshots,
        ...dishesSnapshots,
        ...dishPageSnapshots,
        ...placesSnapshots,
        ...placePageSnapshots,
        ...dishDetailSnapshots,
        ...placeDetailSnapshots,
      ];
      for (const [key, previous] of allSnapshots) {
        queryClient.setQueryData(key, previous);
      }
    };

    return { settle, rollback };
  };

  return { apply };
}
