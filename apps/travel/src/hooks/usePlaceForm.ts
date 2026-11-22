import { useUpdateTravelPlace, type TravelPlaceDto } from '@hatohui/models';
import { useEntityForm } from './useEntityForm';

export function usePlaceForm(place: TravelPlaceDto, onSaved: () => void) {
  const update = useUpdateTravelPlace();
  return useEntityForm(
    {
      name: place.name,
      areaId: place.area?.id ?? '',
      address: place.address ?? '',
      city: place.city ?? '',
      mapsUrl: place.mapsUrl ?? '',
      note: place.note ?? '',
    },
    (data) => update.mutateAsync({ id: place.id, data }),
    onSaved,
  );
}
