import { Input, Textarea } from '@hatohui/ui';
import FieldLabel from './FieldLabel';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'url';
  multiline?: boolean;
  required?: boolean;
  optional?: boolean;
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  required = false,
  optional = false,
}: Props) {
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id} required={required} optional={optional}>
        {label}
      </FieldLabel>
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          placeholder={placeholder}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

export default TextField;
