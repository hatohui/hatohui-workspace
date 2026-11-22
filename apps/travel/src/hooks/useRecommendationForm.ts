import type { FormEvent } from 'react';
import type { TravelRecommendationDto } from '@hatohui/models';
import { useCatalogMatches } from './useCatalogMatches';
import { usePhotoList } from './usePhotoList';
import { useRecommendationFields } from './useRecommendationFields';
import { useSaveRecommendation } from './useSaveRecommendation';
import { useTravelLocation } from './useTravelLocation';

export function useRecommendationForm(
  existing: TravelRecommendationDto | undefined,
  onSaved: () => void,
) {
  const location = useTravelLocation();
  const { fields, set, toggle } = useRecommendationFields(
    existing,
    location.area?.id,
  );
  const photos = usePhotoList(existing?.images ?? []);
  const matches = useCatalogMatches(fields.dishName, fields.placeName);
  const { save } = useSaveRecommendation(existing, onSaved);

  const canSubmit =
    fields.dishName.trim() !== '' && fields.placeName.trim() !== '';

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    save(fields, { dish: matches.dish, place: matches.place }, photos.photos);
  };

  return {
    isEditing: Boolean(existing),
    fields,
    set,
    toggle,
    photos,
    matches,
    canSubmit,
    isSaving: false,
    submit,
  };
}
