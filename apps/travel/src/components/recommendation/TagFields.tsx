import { useTranslation } from '@hatohui/i18n';
import { Flame, Leaf } from 'lucide-react';
import { VEGETARIAN_TAG } from '../../constants/food';
import { useTagOptions } from '../../hooks/useTagOptions';
import type { useRecommendationFields } from '../../hooks/useRecommendationFields';
import { withTag } from '../../lib/withTag';
import FilterChip from '../catalog/FilterChip';
import FormSection from '../shared/FormSection';
import TagGroupInput from './TagGroupInput';

type FieldsApi = ReturnType<typeof useRecommendationFields>;

interface Props {
  fields: FieldsApi['fields'];
  set: FieldsApi['set'];
}

function TagFields({ fields, set }: Props) {
  const { t } = useTranslation();
  const tags = useTagOptions();

  return (
    <FormSection title={t('form.sectionTags')}>
      <div className="flex flex-wrap gap-2">
        <FilterChip
          icon={Flame}
          label={t('catalog.spicy')}
          pressed={fields.spicy}
          onChange={(spicy) => set('spicy', spicy)}
        />
        <FilterChip
          icon={Leaf}
          label={t('catalog.vegetarian')}
          pressed={fields.diets.includes(VEGETARIAN_TAG)}
          onChange={(on) =>
            set('diets', withTag(fields.diets, VEGETARIAN_TAG, on))
          }
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TagGroupInput
          id="rec-allergens"
          label={t('form.allergens')}
          placeholder={t('form.allergensPlaceholder')}
          value={tags.toLabels(fields.allergens)}
          suggestions={tags.suggestionsOf('ALLERGEN')}
          onChange={(next) => set('allergens', tags.toKeys(next, 'ALLERGEN'))}
        />
        <TagGroupInput
          id="rec-tags"
          label={t('form.otherTags')}
          placeholder={t('form.otherTagsPlaceholder')}
          value={tags.toLabels(fields.tags)}
          suggestions={tags.suggestionsOf('GENERAL')}
          onChange={(next) => set('tags', tags.toKeys(next, 'GENERAL'))}
        />
      </div>
    </FormSection>
  );
}

export default TagFields;
