import type { FormEvent } from 'react';
import type { TravelRecommendationDto } from '@hatohui/models';
import { useCatalogMatches } from './useCatalogMatches';
import { usePhotoList } from './usePhotoList';
import { useRecommendationFields } from './useRecommendationFields';
import { useSaveRecommendation } from './useSaveRecommendation';

export function useRecommendationForm(
  existing: TravelRecommendationDto | undefined,
  onSaved: () => void,
) {
  const { fields, set } = useRecommendationFields(existing);
  const photos = usePhotoList(existing?.images ?? []);
  const matches = useCatalogMatches(fields.dishName, fields.placeName);
  const { save, isSaving } = useSaveRecommendation(existing, onSaved);

  const canSubmit =
    fields.dishName.trim() !== '' &&
    fields.placeName.trim() !== '' &&
    !photos.isUploading &&
    !isSaving;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    void save(
      fields,
      { dishId: matches.dish?.id, placeId: matches.place?.id },
      photos.keys,
    );
  };

  return {
    isEditing: Boolean(existing),
    fields,
    set,
    photos,
    matches,
    canSubmit,
    isSaving,
    submit,
  };
}
