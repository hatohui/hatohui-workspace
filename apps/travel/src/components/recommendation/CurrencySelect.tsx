import { useTranslation } from '@hatohui/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { CURRENCIES, type Currency } from '../../constants/travel';

interface Props {
  value: Currency;
  onChange: (value: Currency) => void;
}

function CurrencySelect({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <Select value={value} onValueChange={(next) => onChange(next as Currency)}>
      <SelectTrigger className="w-24" aria-label={t('form.currency')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((currency) => (
          <SelectItem key={currency} value={currency}>
            {currency}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default CurrencySelect;
