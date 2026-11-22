import { useTranslation } from '@hatohui/i18n';
import { Label, TagInput, type TagSuggestion } from '@hatohui/ui';

interface Props {
  id: string;
  label: string;
  placeholder: string;
  value: string[];
  suggestions: TagSuggestion[];
  onChange: (next: string[]) => void;
}

function TagGroupInput(props: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={props.id}>{props.label}</Label>
      <TagInput
        id={props.id}
        value={props.value}
        onChange={props.onChange}
        suggestions={props.suggestions}
        placeholder={props.placeholder}
        showOnEmpty={false}
        createLabel={(tag) => t('form.tagCreate', { tag })}
        removeLabel={(tag) => t('form.tagRemove', { tag })}
      />
    </div>
  );
}

export default TagGroupInput;
