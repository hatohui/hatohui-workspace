import { useTranslation } from '@hatohui/i18n';
import { Label } from '@hatohui/ui';
import { Flame } from 'lucide-react';
import { DIET_ICONS } from '../../constants/travel';
import { useTagOptions } from '../../hooks/useTagOptions';
import type { useRecommendationFields } from '../../hooks/useRecommendationFields';
import TagChipGroup from '../shared/TagChipGroup';
import FilterChip from '../catalog/FilterChip';

type FieldsApi = ReturnType<typeof useRecommendationFields>;

interface Props {
  fields: FieldsApi['fields'];
  set: FieldsApi['set'];
  toggle: FieldsApi['toggle'];
}

function TagFields({ fields, set, toggle }: Props) {
  const { t } = useTranslation();
  const tags = useTagOptions();
  return (
    <div className="space-y-4">
      <FilterChip
        icon={Flame}
        label={t('catalog.spicy')}
        pressed={fields.spicy}
        onChange={(spicy) => set('spicy', spicy)}
      />
      <div className="space-y-1.5">
        <Label>{t('form.diets')}</Label>
        <TagChipGroup
          label={t('form.diets')}
          options={tags.dietKeys}
          selected={fields.diets}
          labelOf={tags.labelOf}
          iconOf={(tag) => DIET_ICONS[tag]}
          onToggle={(tag) => toggle('diets', tag)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>{t('form.allergens')}</Label>
        <TagChipGroup
          label={t('form.allergens')}
          tone="warning"
          options={tags.allergenKeys}
          selected={fields.allergens}
          labelOf={tags.labelOf}
          onToggle={(tag) => toggle('allergens', tag)}
        />
      </div>
    </div>
  );
}

export default TagFields;
