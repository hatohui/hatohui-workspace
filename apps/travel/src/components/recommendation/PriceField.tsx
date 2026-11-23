import { useTranslation } from '@hatohui/i18n';
import { PRICE_MODES } from '../../constants/travel';
import type { PriceFields, SetPriceField } from '../../lib/priceFields';
import ChoiceChips from '../shared/ChoiceChips';
import PriceLevelInput from './PriceLevelInput';
import PriceRangeInput from './PriceRangeInput';

interface Props {
  fields: PriceFields;
  set: SetPriceField;
}

function PriceField({ fields, set }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <ChoiceChips
        label={t('form.sectionPrice')}
        value={fields.priceMode}
        onChange={(mode) => set('priceMode', mode)}
        options={PRICE_MODES.map((mode) => ({
          value: mode,
          label: t(mode === 'range' ? 'form.priceRange' : 'form.priceLevel'),
        }))}
      />
      {fields.priceMode === 'range' ? (
        <PriceRangeInput fields={fields} set={set} />
      ) : (
        <PriceLevelInput
          value={fields.priceLevel}
          onChange={(level) => set('priceLevel', level)}
        />
      )}
    </div>
  );
}

export default PriceField;
