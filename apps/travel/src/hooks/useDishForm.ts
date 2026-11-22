import { useTranslation } from '@hatohui/i18n';
import {
  getTravelDishesQueryKey,
  getTravelDishQueryKey,
  updateTravelDish,
  type TravelDishDto,
} from '@hatohui/models';
import { useDishPhoto } from './useDishPhoto';
import { useEntityForm } from './useEntityForm';
import { useOptimisticEntityPatch } from './useOptimisticEntityPatch';

const DISHES_LIST_KEY = getTravelDishesQueryKey();

export function useDishForm(dish: TravelDishDto, onSaved: () => void) {
  const { t } = useTranslation();
  const photo = useDishPhoto(dish.imageKey, dish.thumbnailUrl ?? dish.imageUrl);
  const patch = useOptimisticEntityPatch<TravelDishDto>(
    getTravelDishQueryKey(dish.id),
    DISHES_LIST_KEY,
  );

  const form = useEntityForm(
    {
      name: dish.name,
      cuisines: dish.cuisines,
      categories: dish.categories,
      description: dish.description ?? '',
    },
    async (data, report) => {
      if (photo.pendingFile) {
        report(t('form.uploadingPhoto'), 0.25);
      }
      const result = await photo.uploadPending();
      if (!result.ok) throw new Error('Image upload failed');
      report(t('form.savingItem', { name: data.name.trim() }), 0.65);
      await updateTravelDish(dish.id, {
        ...data,
        name: data.name.trim(),
        imageKey: result.imageKey,
      });
    },
    onSaved,
    (data) =>
      patch(dish.id, {
        name: data.name.trim(),
        cuisines: data.cuisines,
        categories: data.categories,
        description: data.description || null,
        ...(photo.isChanged && {
          imageUrl: photo.previewUrl,
          thumbnailUrl: photo.previewUrl,
          previewUrl: photo.previewUrl,
          coverImageUrl: photo.previewUrl,
        }),
      }),
  );

  return {
    ...form,
    photo,
    isSaving: form.isSaving || photo.isUploading,
  };
}
