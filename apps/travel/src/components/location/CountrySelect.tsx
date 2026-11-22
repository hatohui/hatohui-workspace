import { useTranslation } from '@hatohui/i18n';
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { useTravelLocation } from '../../hooks/useTravelLocation';

const NONE_VALUE = '__none__';

interface Props {
  id: string;
  value: string;
  onChange: (countryId: string) => void;
}

function CountrySelect({ id, value, onChange }: Props) {
  const { t } = useTranslation();
  const { countries } = useTravelLocation();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t('dishes.country')}</Label>
      <Select
        value={value || NONE_VALUE}
        onValueChange={(next) => onChange(next === NONE_VALUE ? '' : next)}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>{t('dishes.noCountry')}</SelectItem>
          {countries.map((country) => (
            <SelectItem key={country.id} value={country.id}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default CountrySelect;
