import { useTranslation } from '@hatohui/i18n';
import { useImageUpload } from '@hatohui/libs';
import {
  createTravelRecommendation,
  updateTravelRecommendation,
  type TravelPlaceAreaDto,
  type TravelPlaceDto,
  type TravelRecommendationDishInputDto,
  type TravelRecommendationDto,
} from '@hatohui/models';
import { useToast } from '@hatohui/ui';
import { useErrorMessage } from './useErrorMessage';
import { useInvalidateTravel } from './useInvalidateTravel';
import { useOptimisticRecommendation } from './useOptimisticRecommendation';
import type { PhotoItem } from './usePhotoList';
import {
  type DishLine,
  type RecommendationFields,
  pickedDishOf,
} from './useRecommendationFields';
import { useTravelLocation } from './useTravelLocation';

const lineInput = (line: DishLine): TravelRecommendationDishInputDto => {
  const picked = pickedDishOf(line);
  return {
    dishId: picked?.id,
    dishName: picked ? undefined : line.name.trim(),
    cuisines: picked ? undefined : line.cuisines,
    foodCategories: picked ? undefined : line.foodCategories,
    allergens: line.allergens,
  };
};

const detailsOf = (
  fields: RecommendationFields,
  lines: DishLine[],
  imageKeys: string[],
) => ({
  note: fields.note,
  specials: fields.specials,
  tags: fields.tags,
  dishes: lines.map(lineInput),
  imageKeys,
});

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

  const resolveArea = (areaId: string): TravelPlaceAreaDto | null => {
    if (!areaId) return null;
    for (const country of location.countries) {
      const found = country.areas.find((a) => a.id === areaId);
      if (found) {
        return {
          id: found.id,
          name: found.name,
          countryId: country.id,
          countryName: country.name,
        };
      }
    }
    return null;
  };

  const save = (
    fields: RecommendationFields,
    lines: DishLine[],
    place: TravelPlaceDto | undefined,
    photos: PhotoItem[],
  ) => {
    const placeLabel = place?.name ?? fields.placeName.trim();
    const dishLabel =
      lines.length === 1
        ? (pickedDishOf(lines[0])?.name ?? lines[0].name.trim())
        : t('form.dishCount', { count: lines.length });

    const optimisticTx = optimistic.apply({
      existing,
      fields,
      lines,
      place,
      area: resolveArea(fields.areaId),
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
              ...detailsOf(fields, lines, imageKeys),
              placeAreaId: fields.areaId,
            })
          : await createTravelRecommendation({
              ...detailsOf(fields, lines, imageKeys),
              placeId: place?.id,
              place: place?.id
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
            dish:
              saved.dishes.length === 1
                ? saved.dishes[0].dish.name
                : t('form.dishCount', { count: saved.dishes.length }),
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
