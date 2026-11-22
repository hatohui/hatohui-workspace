import { useTranslation } from '@hatohui/i18n';
import { UtensilsCrossed } from 'lucide-react';
import type { useRecommendationForm } from '../../hooks/useRecommendationForm';
import CuisineField from '../shared/CuisineField';
import FoodCategoryField from '../shared/FoodCategoryField';
import MatchedField from './MatchedField';

interface Props {
  form: ReturnType<typeof useRecommendationForm>;
}

function DishInputs({ form }: Props) {
  const { t } = useTranslation();
  const { fields, set, matches, isEditing } = form;
  const isNew = !isEditing && !matches.dish && fields.dishName.trim() !== '';

  return (
    <div className="space-y-4">
      <MatchedField
        id="dish"
        label={t('form.dish')}
        hint={t('form.dishHint')}
        placeholder={t('form.dishPlaceholder')}
        value={fields.dishName}
        options={matches.dishSuggestions}
        fallbackIcon={UtensilsCrossed}
        isMatched={Boolean(matches.dish)}
        disabled={isEditing}
        onChange={(value) => set('dishName', value)}
      />
      {isNew && (
        <div className="grid gap-4 sm:grid-cols-2">
          <CuisineField
            id="cuisines"
            value={fields.cuisines}
            onChange={(value) => set('cuisines', value)}
          />
          <FoodCategoryField
            id="foodCategories"
            value={fields.foodCategories}
            onChange={(value) => set('foodCategories', value)}
          />
        </div>
      )}
    </div>
  );
}

export default DishInputs;
