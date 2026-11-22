import { useTranslation } from '@hatohui/i18n';
import { TagInput } from '@hatohui/ui';
import { MAX_CATEGORIES } from '../../constants/travel';
import { usePlaceCategorySuggestions } from '../../hooks/usePlaceCategorySuggestions';
import FieldLabel from './FieldLabel';

interface Props {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  optional?: boolean;
}

function PlaceCategoryField({ id, value, onChange, optional }: Props) {
  const { t } = useTranslation();
  const suggestions = usePlaceCategorySuggestions();

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id} optional={optional}>
        {t('form.placeCategories')}
      </FieldLabel>
      <TagInput
        id={id}
        value={value}
        onChange={(next) => onChange(next.slice(0, MAX_CATEGORIES))}
        suggestions={suggestions}
        placeholder={t('form.placeCategoriesPlaceholder')}
        createLabel={(tag) => t('form.categoryCreate', { tag })}
        removeLabel={(tag) => t('form.categoryRemove', { tag })}
      />
    </div>
  );
}

export default PlaceCategoryField;
