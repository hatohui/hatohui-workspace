import {
  getTravelDishesQueryKey,
  getTravelDishQueryKey,
  updateTravelDish,
  useTravelCountries,
  type TravelDishDto,
} from '@hatohui/models';
import { useDishPhoto } from './useDishPhoto';
import { useEntityForm } from './useEntityForm';
import { useOptimisticEntityPatch } from './useOptimisticEntityPatch';

const DISHES_LIST_KEY = getTravelDishesQueryKey();

export function useDishForm(dish: TravelDishDto, onSaved: () => void) {
  const countries = useTravelCountries().data?.data ?? [];
  const photo = useDishPhoto(dish.imageKey, dish.thumbnailUrl ?? dish.imageUrl);
  const patch = useOptimisticEntityPatch<TravelDishDto>(
    getTravelDishQueryKey(dish.id),
    DISHES_LIST_KEY,
  );

  const form = useEntityForm(
    {
      name: dish.name,
      cuisines: dish.cuisines,
      description: dish.description ?? '',
      countryId: dish.country?.id ?? '',
    },
    async (data) => {
      const result = await photo.uploadPending();
      if (!result.ok) throw new Error('Image upload failed');
      await updateTravelDish(dish.id, {
        ...data,
        name: data.name.trim(),
        countryId: data.countryId || null,
        imageKey: result.imageKey,
      });
    },
    onSaved,
    (data) =>
      patch(dish.id, {
        name: data.name.trim(),
        cuisines: data.cuisines,
        description: data.description || null,
        country: countries.find((c) => c.id === data.countryId) ?? null,
        ...(photo.isChanged && {
          imageUrl: photo.previewUrl,
          thumbnailUrl: photo.previewUrl,
          previewUrl: photo.previewUrl,
        }),
      }),
  );

  return {
    ...form,
    photo,
    isSaving: form.isSaving || photo.isUploading,
  };
}
