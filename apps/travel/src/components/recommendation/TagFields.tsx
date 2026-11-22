import { useTranslation } from '@hatohui/i18n';
import { useTagOptions } from '../../hooks/useTagOptions';
import type { useRecommendationFields } from '../../hooks/useRecommendationFields';
import FormSection from '../shared/FormSection';
import SpecialTagsInput from './SpecialTagsInput';
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
      <SpecialTagsInput
        id="rec-specials"
        value={fields.specials}
        onChange={(next) => set('specials', next)}
      />
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
