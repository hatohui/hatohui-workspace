import { useTranslation } from '@hatohui/i18n';
import type { DishLine } from '../../hooks/useRecommendationFields';
import { useTagOptions } from '../../hooks/useTagOptions';
import TagGroupInput from './TagGroupInput';

interface Props {
  line: DishLine;
  onChange: (patch: Partial<DishLine>) => void;
}

function DishLineAllergens({ line, onChange }: Props) {
  const { t } = useTranslation();
  const tags = useTagOptions();

  return (
    <TagGroupInput
      id={`dish-allergens-${line.key}`}
      label={t('form.allergens')}
      placeholder={t('form.allergensPlaceholder')}
      value={tags.toLabels(line.allergens)}
      suggestions={tags.suggestionsOf('ALLERGEN')}
      onChange={(next) =>
        onChange({ allergens: tags.toKeys(next, 'ALLERGEN') })
      }
    />
  );
}

export default DishLineAllergens;
