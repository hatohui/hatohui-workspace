import { useTranslation } from '@hatohui/i18n';
import type { useRecommendationForm } from '../../hooks/useRecommendationForm';
import TextField from '../shared/TextField';
import MatchedField from './MatchedField';

interface Props {
  form: ReturnType<typeof useRecommendationForm>;
}

function PlaceInputs({ form }: Props) {
  const { t } = useTranslation();
  const { fields, set, matches, isEditing } = form;
  const isNew = !isEditing && !matches.place && fields.placeName.trim() !== '';

  return (
    <>
      <MatchedField
        id="place"
        label={t('form.place')}
        hint={t('form.placeHint')}
        placeholder={t('form.placePlaceholder')}
        value={fields.placeName}
        options={matches.placeOptions}
        isMatched={Boolean(matches.place)}
        disabled={isEditing}
        onChange={(value) => set('placeName', value)}
      />
      {isNew && (
        <TextField
          id="mapsUrl"
          type="url"
          label={t('form.mapsUrl')}
          placeholder={t('form.mapsUrlPlaceholder')}
          value={fields.mapsUrl}
          onChange={(value) => set('mapsUrl', value)}
        />
      )}
    </>
  );
}

export default PlaceInputs;
