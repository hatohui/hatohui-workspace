import { Input, Label, Textarea } from '@hatohui/ui';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'url';
  multiline?: boolean;
  required?: boolean;
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
}: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
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
