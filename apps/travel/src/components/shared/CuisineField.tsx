import { useTranslation } from '@hatohui/i18n';
import { TagInput } from '@hatohui/ui';
import { MAX_CUISINES } from '../../constants/travel';
import { useCuisineSuggestions } from '../../hooks/useCuisineSuggestions';
import FieldLabel from './FieldLabel';

interface Props {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  optional?: boolean;
}

function CuisineField({ id, value, onChange, optional }: Props) {
  const { t } = useTranslation();
  const suggestions = useCuisineSuggestions();

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id} optional={optional}>
        {t('form.cuisines')}
      </FieldLabel>
      <TagInput
        id={id}
        value={value}
        onChange={(next) => onChange(next.slice(0, MAX_CUISINES))}
        suggestions={suggestions}
        placeholder={t('form.cuisinesPlaceholder')}
        createLabel={(tag) => t('form.cuisineCreate', { tag })}
        removeLabel={(tag) => t('form.cuisineRemove', { tag })}
      />
    </div>
  );
}

export default CuisineField;
