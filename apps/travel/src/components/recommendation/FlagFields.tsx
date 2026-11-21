import { useTranslation } from '@hatohui/i18n';
import { Label } from '@hatohui/ui';
import { Flame, Leaf } from 'lucide-react';
import type { useRecommendationFields } from '../../hooks/useRecommendationFields';
import FilterChip from '../catalog/FilterChip';

type FieldsApi = ReturnType<typeof useRecommendationFields>;

interface Props {
  fields: FieldsApi['fields'];
  set: FieldsApi['set'];
}

function FlagFields({ fields, set }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1.5">
      <Label>{t('form.flags')}</Label>
      <div className="flex gap-2">
        <FilterChip
          icon={Flame}
          label={t('catalog.spicy')}
          pressed={fields.spicy}
          onChange={(value) => set('spicy', value)}
        />
        <FilterChip
          icon={Leaf}
          label={t('catalog.vegetarian')}
          pressed={fields.vegetarian}
          onChange={(value) => set('vegetarian', value)}
        />
      </div>
    </div>
  );
}

export default FlagFields;
