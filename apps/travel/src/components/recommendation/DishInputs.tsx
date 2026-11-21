import { useTranslation } from '@hatohui/i18n';
import type { useRecommendationForm } from '../../hooks/useRecommendationForm';
import TextField from '../shared/TextField';
import MatchedField from './MatchedField';

interface Props {
  form: ReturnType<typeof useRecommendationForm>;
}

function DishInputs({ form }: Props) {
  const { t } = useTranslation();
  const { fields, set, matches, isEditing } = form;
  const isNew = !isEditing && !matches.dish && fields.dishName.trim() !== '';

  return (
    <>
      <MatchedField
        id="dish"
        label={t('form.dish')}
        hint={t('form.dishHint')}
        placeholder={t('form.dishPlaceholder')}
        value={fields.dishName}
        options={matches.dishOptions}
        isMatched={Boolean(matches.dish)}
        disabled={isEditing}
        onChange={(value) => set('dishName', value)}
      />
      {isNew && (
        <TextField
          id="cuisine"
          label={t('form.cuisine')}
          placeholder={t('form.cuisinePlaceholder')}
          value={fields.cuisine}
          onChange={(value) => set('cuisine', value)}
        />
      )}
    </>
  );
}

export default DishInputs;
