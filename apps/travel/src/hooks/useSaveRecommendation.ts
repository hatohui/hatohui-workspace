import { useTranslation } from '@hatohui/i18n';
import { useImageUpload } from '@hatohui/libs';
import {
  createTravelRecommendation,
  updateTravelRecommendation,
  type TravelDishDto,
  type TravelPlaceAreaDto,
  type TravelPlaceDto,
  type TravelRecommendationDto,
} from '@hatohui/models';
import { useToast } from '@hatohui/ui';
import { useErrorMessage } from './useErrorMessage';
import { useInvalidateTravel } from './useInvalidateTravel';
import { useOptimisticRecommendation } from './useOptimisticRecommendation';
import type { PhotoItem } from './usePhotoList';
import type { RecommendationFields } from './useRecommendationFields';
import { useTravelLocation } from './useTravelLocation';

interface Matches {
  dish?: TravelDishDto;
  place?: TravelPlaceDto;
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
    specials: fields.specials,
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
  const location = useTravelLocation();
  const { uploadImage } = useImageUpload();
  const invalidate = useInvalidateTravel();
  const optimistic = useOptimisticRecommendation();
  const toast = useToast();
  const errorMessage = useErrorMessage();

  const save = (
    fields: RecommendationFields,
    matches: Matches,
    photos: PhotoItem[],
  ) => {
    const dishLabel = matches.dish?.name ?? fields.dishName.trim();
    const placeLabel = matches.place?.name ?? fields.placeName.trim();

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

    const optimisticTx = optimistic.apply({
      existing,
      fields,
      dish: matches.dish,
      place: matches.place,
      area: resolvedArea,
      photos,
    });

    onSaved();

    const pendingPhotos = photos.filter((photo) => !photo.key && photo.file);
    const totalPhotos = pendingPhotos.length;
    const savingLabel = t(existing ? 'form.updatingPick' : 'form.addingPick', {
      dish: dishLabel,
      place: placeLabel,
    });
    const uploadText = (done: number) =>
      totalPhotos === 1
        ? t('form.uploadingPhoto')
        : t('form.uploadingPhotosProgress', { done, total: totalPhotos });

    const toastId = toast.loading(
      totalPhotos > 0 ? uploadText(0) : savingLabel,
      totalPhotos > 0 ? 0.08 : 0.35,
    );

    void (async () => {
      try {
        const uploadedKeys = new Map<string, string>();
        if (totalPhotos > 0) {
          let uploadedCount = 0;
          await Promise.all(
            pendingPhotos.map(async (photo) => {
              if (!photo.file) return;
              const { key } = await uploadImage(photo.file);
              uploadedKeys.set(photo.id, key);
              uploadedCount += 1;
              toast.update(
                toastId,
                uploadText(uploadedCount),
                'loading',
                0.08 + (uploadedCount / totalPhotos) * 0.52,
              );
            }),
          );
          toast.update(toastId, savingLabel, 'loading', 0.72);
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
              foodCategories: matches.dish?.id
                ? undefined
                : fields.foodCategories,
              placeId: matches.place?.id,
              place: matches.place?.id
                ? undefined
                : {
                    name: fields.placeName,
                    mapsUrl: fields.mapsUrl || undefined,
                    areaId: fields.areaId || undefined,
                    categories: fields.placeCategories,
                  },
            });

        const saved = response.data;
        optimisticTx.settle(saved);
        toast.update(toastId, t('form.refreshingCatalog'), 'loading', 0.88);
        await invalidate();
        toast.update(
          toastId,
          t(existing ? 'form.updatedPick' : 'form.addedPick', {
            dish: saved.dish.name,
            place: saved.place.name,
          }),
          'success',
        );
      } catch (error) {
        optimisticTx.rollback();
        toast.update(toastId, errorMessage(error), 'error');
      } finally {
        revokeBlobUrls(photos);
      }
    })();
  };

  return { save };
}
