import { useState, type FormEvent } from 'react';
import type {
  TravelDishDto,
  TravelPlaceDto,
  TravelRecommendationDto,
} from '@hatohui/models';
import { normalizeCatalogName, useCatalogMatches } from './useCatalogMatches';
import { usePhotoList } from './usePhotoList';
import { useRecommendationFields } from './useRecommendationFields';
import { useSaveRecommendation } from './useSaveRecommendation';
import { useHasAreas } from './useHasAreas';
import { useTravelLocation } from './useTravelLocation';

export function useRecommendationForm(
  existing: TravelRecommendationDto | undefined,
  onSaved: () => void,
  initialDishName?: string,
) {
  const location = useTravelLocation();
  const { fields, set, toggle } = useRecommendationFields(
    existing,
    location.area?.id,
    initialDishName,
  );
  const photos = usePhotoList(existing?.images ?? []);
  const matches = useCatalogMatches(fields.dishName, fields.placeName);
  const [pickedDish, setPickedDish] = useState<TravelDishDto | null>(null);
  const [pickedPlace, setPickedPlace] = useState<TravelPlaceDto | null>(null);
  const { save } = useSaveRecommendation(existing, onSaved);

  const matchedDish =
    matches.dish ??
    (pickedDish &&
    normalizeCatalogName(pickedDish.name) ===
      normalizeCatalogName(fields.dishName)
      ? pickedDish
      : undefined);
  const matchedPlace =
    matches.place ??
    (pickedPlace &&
    normalizeCatalogName(pickedPlace.name) ===
      normalizeCatalogName(fields.placeName)
      ? pickedPlace
      : undefined);

  const hasAreas = useHasAreas();
  const needsArea =
    hasAreas && !existing && !matchedPlace && fields.areaId === '';

  const canSubmit =
    fields.dishName.trim() !== '' &&
    fields.placeName.trim() !== '' &&
    !needsArea;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    save(fields, { dish: matchedDish, place: matchedPlace }, photos.photos);
  };

  return {
    isEditing: Boolean(existing),
    fields,
    set,
    toggle,
    photos,
    matches: {
      ...matches,
      dish: matchedDish,
      place: matchedPlace,
    },
    pickDish: (id: string) => setPickedDish(matches.findDishById(id)),
    pickPlace: (id: string) => setPickedPlace(matches.findPlaceById(id)),
    canSubmit,
    isSaving: false,
    submit,
  };
}
