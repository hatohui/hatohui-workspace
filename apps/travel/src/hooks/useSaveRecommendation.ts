import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useTranslation } from '@hatohui/i18n';
import { useImageUpload } from '@hatohui/libs';
import {
  createTravelRecommendation,
  getTravelRecommendationsQueryKey,
  updateTravelRecommendation,
  type TravelDishDto,
  type TravelPlaceAreaDto,
  type TravelPlaceDto,
  type TravelRecommendationDto,
} from '@hatohui/models';
import { useToast } from '@hatohui/ui';
import {
  buildOptimisticRecommendation,
  createOptimisticId,
  shouldPrependToQuery,
} from '../lib/optimistic';
import { useErrorMessage } from './useErrorMessage';
import { useInvalidateTravel } from './useInvalidateTravel';
import type { PhotoItem } from './usePhotoList';
import type { RecommendationFields } from './useRecommendationFields';
import { useTravelLocation } from './useTravelLocation';

interface Matches {
  dish?: TravelDishDto;
  place?: TravelPlaceDto;
}

interface RecommendationsCache {
  data: TravelRecommendationDto[];
}

const toAmount = (value: string) => (value === '' ? null : Number(value));

const detailsOf = (fields: RecommendationFields, imageKeys: string[]) => {
  const isRange = fields.priceMode === 'range';
  return {
    note: fields.note,
    priceMin: isRange ? toAmount(fields.priceMin) : null,
    priceMax: isRange ? toAmount(fields.priceMax || fields.priceMin) : null,
    priceLevel: isRange ? null : fields.priceLevel,
    currency: fields.currency,
    spicy: fields.spicy,
    diets: fields.diets,
    allergens: fields.allergens,
    tags: fields.tags,
    imageKeys,
  };
};

const revokeBlobUrls = (photos: PhotoItem[]) => {
  for (const photo of photos) {
    if (photo.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url);
    }
  }
};

export function useSaveRecommendation(
  existing: TravelRecommendationDto | undefined,
  onSaved: () => void,
) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const location = useTravelLocation();
  const { uploadImage } = useImageUpload();
  const invalidate = useInvalidateTravel();
  const toast = useToast();
  const errorMessage = useErrorMessage();

  const save = (
    fields: RecommendationFields,
    matches: Matches,
    photos: PhotoItem[],
  ) => {
    const queryKeyPrefix = getTravelRecommendationsQueryKey();
    const dishLabel = matches.dish?.name ?? fields.dishName.trim();
    const tempId = existing?.id ?? createOptimisticId();

    let resolvedArea: TravelPlaceAreaDto | null = null;
    if (fields.areaId) {
      for (const country of location.countries) {
        const found = country.areas.find((a) => a.id === fields.areaId);
        if (found) {
          resolvedArea = {
            id: found.id,
            name: found.name,
            countryId: country.id,
            countryName: country.name,
          };
          break;
        }
      }
    }

    const optimistic = buildOptimisticRecommendation({
      id: tempId,
      existing,
      fields,
      dish: matches.dish,
      place: matches.place,
      area: resolvedArea,
      photos,
    });

    const snapshots: Array<[QueryKey, RecommendationsCache | undefined]> =
      queryClient.getQueriesData<RecommendationsCache>({
        queryKey: queryKeyPrefix,
      });

    void queryClient.cancelQueries({ queryKey: queryKeyPrefix });

    for (const [key, current] of snapshots) {
      if (!current?.data) continue;
      if (existing) {
        queryClient.setQueryData<RecommendationsCache>(key, {
          ...current,
          data: current.data.map((item) =>
            item.id === existing.id ? optimistic : item,
          ),
        });
      } else if (
        shouldPrependToQuery(key, matches.dish?.id, matches.place?.id)
      ) {
        queryClient.setQueryData<RecommendationsCache>(key, {
          ...current,
          data: [optimistic, ...current.data],
        });
      }
    }

    onSaved();

    const pendingPhotos = photos.filter((photo) => !photo.key && photo.file);
    const toastId = toast.loading(
      pendingPhotos.length > 0
        ? t('form.uploadingPhotos', { count: pendingPhotos.length })
        : t('form.savingItem', { name: dishLabel }),
    );

    void (async () => {
      try {
        const uploadedKeys = new Map<string, string>();
        if (pendingPhotos.length > 0) {
          await Promise.all(
            pendingPhotos.map(async (photo) => {
              if (!photo.file) return;
              const { key } = await uploadImage(photo.file);
              uploadedKeys.set(photo.id, key);
            }),
          );
          toast.update(
            toastId,
            t('form.savingItem', { name: dishLabel }),
            'loading',
          );
        }

        const imageKeys = photos.flatMap((photo) => {
          const key = photo.key ?? uploadedKeys.get(photo.id);
          return key ? [key] : [];
        });

        const response = existing
          ? await updateTravelRecommendation(existing.id, {
              ...detailsOf(fields, imageKeys),
              placeAreaId: fields.areaId,
            })
          : await createTravelRecommendation({
              ...detailsOf(fields, imageKeys),
              dishId: matches.dish?.id,
              dishName: matches.dish?.id ? undefined : fields.dishName,
              cuisines: matches.dish?.id ? undefined : fields.cuisines,
              placeId: matches.place?.id,
              place: matches.place?.id
                ? undefined
                : {
                    name: fields.placeName,
                    mapsUrl: fields.mapsUrl || undefined,
                    areaId: fields.areaId || undefined,
                  },
            });

        const saved = response.data;
        const currentQueries = queryClient.getQueriesData<RecommendationsCache>(
          {
            queryKey: queryKeyPrefix,
          },
        );
        for (const [key, current] of currentQueries) {
          if (!current?.data) continue;
          queryClient.setQueryData<RecommendationsCache>(key, {
            ...current,
            data: current.data.map((item) =>
              item.id === tempId ? saved : item,
            ),
          });
        }

        toast.update(
          toastId,
          t('form.savedItem', { name: saved.dish.name }),
          'success',
        );
        await invalidate();
      } catch (error) {
        for (const [key, previous] of snapshots) {
          queryClient.setQueryData(key, previous);
        }
        toast.update(toastId, errorMessage(error), 'error');
      } finally {
        revokeBlobUrls(photos);
      }
    })();
  };

  return { save };
}
