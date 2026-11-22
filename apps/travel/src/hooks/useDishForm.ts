import { useUpdateTravelDish, type TravelDishDto } from '@hatohui/models';
import { useDishPhoto } from './useDishPhoto';
import { useEntityForm } from './useEntityForm';

export function useDishForm(dish: TravelDishDto, onSaved: () => void) {
  const update = useUpdateTravelDish();
  const photo = useDishPhoto(dish.imageKey, dish.thumbnailUrl ?? dish.imageUrl);
  const form = useEntityForm(
    {
      name: dish.name,
      cuisines: dish.cuisines,
      description: dish.description ?? '',
    },
    async (data) => {
      const result = await photo.uploadPending();
      if (!result.ok) throw new Error('Image upload failed');
      await update.mutateAsync({
        id: dish.id,
        data: { ...data, imageKey: result.imageKey },
      });
    },
    onSaved,
  );

  return {
    ...form,
    photo,
    isSaving: form.isSaving || photo.isUploading,
  };
}
