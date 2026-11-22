import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { MapPin } from 'lucide-react';
import type { useRecommendationForm } from '../../hooks/useRecommendationForm';
import AreaSelect from '../location/AreaSelect';
import MapsLinkField from '../maps/MapsLinkField';
import PlaceCategoryField from '../shared/PlaceCategoryField';
import MatchedField from './MatchedField';

interface Props {
  form: ReturnType<typeof useRecommendationForm>;
}

function PlaceInputs({ form }: Props) {
  const { t } = useTranslation();
  const { fields, set, matches, pickPlace, isEditing } = form;
  const isNewPlace =
    !isEditing && !matches.place && fields.placeName.trim() !== '';
  const showArea = isNewPlace || isEditing;

  return (
    <div
      className={cn(
        'grid gap-4',
        showArea && 'sm:grid-cols-[minmax(0,1fr)_220px]',
      )}
    >
      <MatchedField
        id="place"
        label={t('form.place')}
        hint={t('form.placeHint')}
        placeholder={t('form.placePlaceholder')}
        value={fields.placeName}
        options={matches.placeSuggestions}
        fallbackIcon={MapPin}
        isMatched={Boolean(matches.place)}
        disabled={isEditing}
        onChange={(value) => set('placeName', value)}
        onSelect={(item) => pickPlace(item.id)}
      />
      {showArea && (
        <AreaSelect
          id="placeArea"
          value={fields.areaId}
          onChange={(value) => set('areaId', value)}
        />
      )}
      {isNewPlace && (
        <>
          <div className="sm:col-span-2">
            <MapsLinkField
              id="mapsUrl"
              url={fields.mapsUrl}
              placeName={fields.placeName}
              onUrlChange={(value) => set('mapsUrl', value)}
              onUseName={(name) => set('placeName', name)}
            />
          </div>
          <div className="sm:col-span-2">
            <PlaceCategoryField
              id="placeCategories"
              optional
              value={fields.placeCategories}
              onChange={(value) => set('placeCategories', value)}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default PlaceInputs;
