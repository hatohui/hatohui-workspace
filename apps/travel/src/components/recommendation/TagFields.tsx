import { useTranslation } from '@hatohui/i18n';
import { Label, TagInput } from '@hatohui/ui';
import { Flame } from 'lucide-react';
import { useTagOptions } from '../../hooks/useTagOptions';
import type { useRecommendationFields } from '../../hooks/useRecommendationFields';
import FilterChip from '../catalog/FilterChip';
import FormSection from '../shared/FormSection';

type FieldsApi = ReturnType<typeof useRecommendationFields>;

interface Props {
  fields: FieldsApi['fields'];
  set: FieldsApi['set'];
}

function TagFields({ fields, set }: Props) {
  const { t } = useTranslation();
  const tags = useTagOptions();
  const createLabel = (tag: string) => t('form.tagCreate', { tag });
  const removeLabel = (tag: string) => t('form.tagRemove', { tag });

  return (
    <div className="space-y-5">
      <FormSection title={t('form.noticeTags')}>
        <div className="space-y-3">
          <FilterChip
            icon={Flame}
            label={t('catalog.spicy')}
            pressed={fields.spicy}
            onChange={(spicy) => set('spicy', spicy)}
          />
          <div className="space-y-1.5">
            <Label htmlFor="rec-diets">{t('form.diets')}</Label>
            <TagInput
              id="rec-diets"
              value={tags.toLabels(fields.diets)}
              onChange={(next) => set('diets', tags.toKeys(next, 'DIET'))}
              suggestions={tags.suggestionsOf('DIET')}
              placeholder={t('form.dietsPlaceholder')}
              createLabel={createLabel}
              removeLabel={removeLabel}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rec-allergens">{t('form.allergens')}</Label>
            <TagInput
              id="rec-allergens"
              value={tags.toLabels(fields.allergens)}
              onChange={(next) =>
                set('allergens', tags.toKeys(next, 'ALLERGEN'))
              }
              suggestions={tags.suggestionsOf('ALLERGEN')}
              placeholder={t('form.allergensPlaceholder')}
              createLabel={createLabel}
              removeLabel={removeLabel}
            />
          </div>
        </div>
      </FormSection>
      <FormSection title={t('form.otherTags')}>
        <TagInput
          id="rec-tags"
          value={tags.toLabels(fields.tags)}
          onChange={(next) => set('tags', tags.toKeys(next, 'GENERAL'))}
          suggestions={tags.suggestionsOf('GENERAL')}
          placeholder={t('form.otherTagsPlaceholder')}
          createLabel={createLabel}
          removeLabel={removeLabel}
        />
      </FormSection>
    </div>
  );
}

export default TagFields;
