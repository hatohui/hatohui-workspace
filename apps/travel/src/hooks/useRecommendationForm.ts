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
  const { fields, set, toggle } = useRecommendationFields(existing);
  const photos = usePhotoList(existing?.images ?? []);
  const matches = useCatalogMatches(fields.dishName, fields.placeName);
  const { save, isSaving } = useSaveRecommendation(existing, onSaved);

  const busy = photos.isUploading || isSaving;
  const canSubmit =
    fields.dishName.trim() !== '' && fields.placeName.trim() !== '' && !busy;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    const keys = await photos.uploadPending();
    if (!keys) return;
    await save(
      fields,
      { dishId: matches.dish?.id, placeId: matches.place?.id },
      keys,
    );
  };

  return {
    isEditing: Boolean(existing),
    fields,
    set,
    toggle,
    photos,
    matches,
    canSubmit,
    isSaving: busy,
    submit: (event: FormEvent) => void submit(event),
  };
}
