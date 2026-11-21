import { useTranslation } from '@hatohui/i18n';
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import {
  CURRENCIES,
  ESTIMATE_PRESETS,
  type Currency,
} from '../../constants/travel';
import { useFormatEstimate } from '../../hooks/useFormatEstimate';
import type { useRecommendationFields } from '../../hooks/useRecommendationFields';
import PresetChip from './PresetChip';

type FieldsApi = ReturnType<typeof useRecommendationFields>;

interface Props {
  fields: FieldsApi['fields'];
  set: FieldsApi['set'];
}

function PriceField({ fields, set }: Props) {
  const { t } = useTranslation();
  const format = useFormatEstimate();

  return (
    <div className="space-y-1.5">
      <Label htmlFor="estimate">{t('form.estimate')}</Label>
      <div className="flex gap-2">
        <Input
          id="estimate"
          type="number"
          min={0}
          inputMode="numeric"
          value={fields.estimate}
          onChange={(event) => set('estimate', event.target.value)}
        />
        <Select
          value={fields.currency}
          onValueChange={(value) => set('currency', value as Currency)}
        >
          <SelectTrigger className="w-28" aria-label={t('form.currency')}>
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
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ESTIMATE_PRESETS[fields.currency].map((amount) => (
          <PresetChip
            key={amount}
            label={format(amount, fields.currency)}
            selected={fields.estimate === String(amount)}
            onClick={() => set('estimate', String(amount))}
          />
        ))}
      </div>
    </div>
  );
}

export default PriceField;
