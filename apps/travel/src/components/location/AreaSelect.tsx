import { useTranslation } from '@hatohui/i18n';
import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { useTravelLocation } from '../../hooks/useTravelLocation';

const NONE_VALUE = '__none__';

interface Props {
  id: string;
  value: string;
  onChange: (areaId: string) => void;
  disabled?: boolean;
}

function AreaSelect({ id, value, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const { countries } = useTravelLocation();
  const populated = countries.filter((country) => country.areas.length > 0);

  if (populated.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t('form.area')}</Label>
      <Select
        value={value || NONE_VALUE}
        onValueChange={(next) => onChange(next === NONE_VALUE ? '' : next)}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={t('form.areaPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>{t('form.areaNone')}</SelectItem>
          {populated.map((country) => (
            <SelectGroup key={country.id}>
              <div className="px-2 py-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {country.name}
              </div>
              {country.areas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default AreaSelect;
