import { useUpdateTravelPlace, type TravelPlaceDto } from '@hatohui/models';
import { useEntityForm } from './useEntityForm';
import { useHasAreas } from './useHasAreas';

export function usePlaceForm(place: TravelPlaceDto, onSaved: () => void) {
  const update = useUpdateTravelPlace();
  const hasAreas = useHasAreas();
  const form = useEntityForm(
    {
      name: place.name,
      areaId: place.area?.id ?? '',
      categories: place.categories,
      address: place.address ?? '',
      mapsUrl: place.mapsUrl ?? '',
      note: place.note ?? '',
    },
    (data) => update.mutateAsync({ id: place.id, data }),
    onSaved,
  );
  const canSubmit =
    form.values.name.trim() !== '' && (!hasAreas || form.values.areaId !== '');
  return { ...form, canSubmit };
}
