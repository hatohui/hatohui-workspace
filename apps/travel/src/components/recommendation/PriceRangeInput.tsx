import { useTranslation } from '@hatohui/i18n';
import { Input, Label } from '@hatohui/ui';
import { PRICE_PRESETS } from '../../constants/travel';
import { useFormatEstimate } from '../../hooks/useFormatEstimate';
import type { useRecommendationFields } from '../../hooks/useRecommendationFields';
import CurrencySelect from './CurrencySelect';
import PresetChip from './PresetChip';

type FieldsApi = ReturnType<typeof useRecommendationFields>;

interface Props {
  fields: FieldsApi['fields'];
  set: FieldsApi['set'];
}

function PriceRangeInput({ fields, set }: Props) {
  const { t } = useTranslation();
  const format = useFormatEstimate();

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="price-min">{t('form.priceFrom')}</Label>
          <Input
            id="price-min"
            type="number"
            min={0}
            inputMode="numeric"
            value={fields.priceMin}
            onChange={(event) => set('priceMin', event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price-max">{t('form.priceTo')}</Label>
          <Input
            id="price-max"
            type="number"
            min={0}
            inputMode="numeric"
            value={fields.priceMax}
            onChange={(event) => set('priceMax', event.target.value)}
          />
        </div>
        <CurrencySelect
          value={fields.currency}
          onChange={(currency) => set('currency', currency)}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRICE_PRESETS[fields.currency].map(([min, max]) => (
          <PresetChip
            key={min}
            label={t('recommendation.priceRange', {
              min: format(min, fields.currency),
              max: format(max, fields.currency),
            })}
            selected={
              fields.priceMin === String(min) && fields.priceMax === String(max)
            }
            onClick={() => {
              set('priceMin', String(min));
              set('priceMax', String(max));
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default PriceRangeInput;
