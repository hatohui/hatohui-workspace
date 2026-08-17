import { Input, Label } from '@hatohui/ui';

type Props = {
  id: string;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  disabled: boolean;
  onChange: (value: number) => void;
};

function ReminderOffsetField({
  id,
  label,
  hint,
  value,
  min,
  max,
  disabled,
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-normal">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.valueAsNumber)}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export default ReminderOffsetField;
