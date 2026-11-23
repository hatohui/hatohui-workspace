import { useState, type FormEvent } from 'react';
import type { TravelPlaceDto, TravelRecommendationDto } from '@hatohui/models';
import { MAPS_LINK_PATTERN } from '../constants/maps';
import { sameCatalogName } from '../lib/catalogName';
import { usePhotoList } from './usePhotoList';
import { usePlaceSearch } from './usePlaceSearch';
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
  const form = useRecommendationFields(
    existing,
    location.area?.id,
    initialDishName,
  );
  const { fields, set, lines } = form;
  const photos = usePhotoList(existing?.images ?? []);
  const placeSearch = usePlaceSearch(fields.placeName);
  const [pickedPlace, setPickedPlace] = useState<TravelPlaceDto | null>(null);
  const { save } = useSaveRecommendation(existing, onSaved);

  const matchedPlace =
    placeSearch.match ??
    (pickedPlace && sameCatalogName(pickedPlace.name, fields.placeName)
      ? pickedPlace
      : undefined);

  const hasAreas = useHasAreas();
  const needsArea =
    hasAreas && !existing && !matchedPlace && fields.areaId === '';
  const namedLines = lines.filter((line) => line.name.trim() !== '');

  const canSubmit =
    namedLines.length > 0 && fields.placeName.trim() !== '' && !needsArea;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    save(fields, namedLines, matchedPlace, photos.photos);
  };

  return {
    ...form,
    isEditing: Boolean(existing),
    photos,
    place: {
      suggestions: placeSearch.suggestions,
      isSearching: placeSearch.isSearching,
      match: matchedPlace,
    },
    pickPlace: (id: string) => setPickedPlace(placeSearch.findById(id)),
    setPlaceInput: (value: string) => {
      const trimmed = value.trim();
      if (!MAPS_LINK_PATTERN.test(trimmed)) return set('placeName', value);
      set('mapsUrl', trimmed);
      set('placeName', '');
    },
    canSubmit,
    isSaving: false,
    submit,
  };
}
