import { useTranslation } from '@hatohui/i18n';
import { Label } from '@hatohui/ui';
import { ALLERGEN_TAGS, DIET_TAGS, SPICE_LEVELS } from '../../constants/travel';
import type { useRecommendationFields } from '../../hooks/useRecommendationFields';
import ChoiceChips from '../shared/ChoiceChips';
import TagChipGroup from '../shared/TagChipGroup';
import SpiceFlames from './SpiceFlames';

type FieldsApi = ReturnType<typeof useRecommendationFields>;

interface Props {
  fields: FieldsApi['fields'];
  set: FieldsApi['set'];
  toggle: FieldsApi['toggle'];
}

function TagFields({ fields, set, toggle }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('form.spice')}</Label>
        <ChoiceChips
          label={t('form.spice')}
          value={fields.spiceLevel}
          onChange={(level) => set('spiceLevel', level)}
          options={SPICE_LEVELS.map((level) => ({
            value: level,
            label: (
              <>
                <SpiceFlames level={level} />
                {t(`spice.${level}`)}
              </>
            ),
          }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label>{t('form.diets')}</Label>
        <TagChipGroup
          label={t('form.diets')}
          options={DIET_TAGS}
          selected={fields.diets}
          labelOf={(tag) => t(`diet.${tag}`)}
          onToggle={(tag) => toggle('diets', tag)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>{t('form.allergens')}</Label>
        <TagChipGroup
          label={t('form.allergens')}
          tone="warning"
          options={ALLERGEN_TAGS}
          selected={fields.allergens}
          labelOf={(tag) => t(`allergen.${tag}`)}
          onToggle={(tag) => toggle('allergens', tag)}
        />
      </div>
    </div>
  );
}

export default TagFields;
