import { useUpdateTravelDish, type TravelDishDto } from '@hatohui/models';
import { useEntityForm } from './useEntityForm';

export function useDishForm(dish: TravelDishDto, onSaved: () => void) {
  const update = useUpdateTravelDish();
  return useEntityForm(
    {
      name: dish.name,
      cuisines: dish.cuisines,
      description: dish.description ?? '',
      imageKey: dish.imageKey,
    },
    (data) => update.mutateAsync({ id: dish.id, data }),
    onSaved,
  );
}
