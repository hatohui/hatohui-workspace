import { useTranslation } from '@hatohui/i18n';
import { MapPin } from 'lucide-react';
import type { useRecommendationForm } from '../../hooks/useRecommendationForm';
import AreaSelect from '../location/AreaSelect';
import MapsLinkField from '../maps/MapsLinkField';
import MatchedField from './MatchedField';

interface Props {
  form: ReturnType<typeof useRecommendationForm>;
}

function PlaceInputs({ form }: Props) {
  const { t } = useTranslation();
  const { fields, set, matches, isEditing } = form;
  const isNewPlace = !isEditing && !matches.place;
  const showArea = isNewPlace || isEditing;

  return (
    <div className="space-y-4">
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
      />
      {showArea && (
        <AreaSelect
          id="placeArea"
          value={fields.areaId}
          onChange={(value) => set('areaId', value)}
        />
      )}
      {isNewPlace && (
        <MapsLinkField
          id="mapsUrl"
          url={fields.mapsUrl}
          placeName={fields.placeName}
          onUrlChange={(value) => set('mapsUrl', value)}
          onUseName={(name) => set('placeName', name)}
        />
      )}
    </div>
  );
}

export default PlaceInputs;
