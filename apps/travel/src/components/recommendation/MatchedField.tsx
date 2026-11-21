import { useTranslation } from '@hatohui/i18n';
import { Input, Label, cn } from '@hatohui/ui';

interface Props {
  id: string;
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  options: string[];
  isMatched: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
}

function MatchedField(props: Props) {
  const { t } = useTranslation();
  const listId = `${props.id}-options`;
  const hasValue = props.value.trim() !== '';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={props.id}>{props.label}</Label>
        {hasValue && !props.disabled && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs',
              props.isMatched
                ? 'bg-secondary text-muted-foreground'
                : 'bg-primary/15 text-primary',
            )}
          >
            {t(props.isMatched ? 'form.existing' : 'form.new')}
          </span>
        )}
      </div>
      <Input
        id={props.id}
        list={listId}
        required
        value={props.value}
        disabled={props.disabled}
        placeholder={props.placeholder}
        autoComplete="off"
        onChange={(event) => props.onChange(event.target.value)}
      />
      <datalist id={listId}>
        {props.options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      {!props.disabled && (
        <p className="text-xs text-muted-foreground">{props.hint}</p>
      )}
    </div>
  );
}

export default MatchedField;
