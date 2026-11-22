import { useTranslation } from '@hatohui/i18n';
import type { SpotFormValues } from '../../hooks/useSpotForm';
import { useTagOptions } from '../../hooks/useTagOptions';
import SpecialTagsInput from '../recommendation/SpecialTagsInput';
import TagGroupInput from '../recommendation/TagGroupInput';
import FormSection from '../shared/FormSection';

interface Props {
  values: SpotFormValues;
  set: <K extends keyof SpotFormValues>(
    key: K,
    value: SpotFormValues[K],
  ) => void;
}

function SpotTagFields({ values, set }: Props) {
  const { t } = useTranslation();
  const tags = useTagOptions();

  return (
    <FormSection title={t('form.sectionTags')}>
      <SpecialTagsInput
        id="spot-specials"
        value={values.specials}
        onChange={(next) => set('specials', next)}
      />
      <TagGroupInput
        id="spot-tags"
        label={t('form.otherTags')}
        placeholder={t('form.otherTagsPlaceholder')}
        value={tags.toLabels(values.tags)}
        suggestions={tags.suggestionsOf('GENERAL')}
        onChange={(next) => set('tags', tags.toKeys(next, 'GENERAL'))}
      />
    </FormSection>
  );
}

export default SpotTagFields;
