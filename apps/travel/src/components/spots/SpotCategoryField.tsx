import { useTranslation } from '@hatohui/i18n';
import { TagInput } from '@hatohui/ui';
import { MAX_CATEGORIES } from '../../constants/travel';
import { useSpotCategorySuggestions } from '../../hooks/useSpotCategorySuggestions';
import FieldLabel from '../shared/FieldLabel';

interface Props {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  optional?: boolean;
}

function SpotCategoryField({ id, value, onChange, optional }: Props) {
  const { t } = useTranslation();
  const suggestions = useSpotCategorySuggestions();

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id} optional={optional}>
        {t('form.spotCategories')}
      </FieldLabel>
      <TagInput
        id={id}
        value={value}
        onChange={(next) => onChange(next.slice(0, MAX_CATEGORIES))}
        suggestions={suggestions}
        placeholder={t('form.spotCategoriesPlaceholder')}
        createLabel={(tag) => t('form.categoryCreate', { tag })}
        removeLabel={(tag) => t('form.categoryRemove', { tag })}
      />
    </div>
  );
}

export default SpotCategoryField;
