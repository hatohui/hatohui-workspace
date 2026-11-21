import { useTranslation } from '@hatohui/i18n';
import type { TravelPriceLevel } from '@hatohui/models';
import { PRICE_LEVELS } from '../../constants/travel';
import ChoiceChips from '../shared/ChoiceChips';
import PriceLevelSymbol from './PriceLevelSymbol';

interface Props {
  value: TravelPriceLevel | null;
  onChange: (value: TravelPriceLevel) => void;
}

function PriceLevelInput({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <ChoiceChips
        label={t('form.priceLevel')}
        value={value}
        onChange={onChange}
        options={PRICE_LEVELS.map((level) => ({
          value: level,
          label: (
            <>
              <PriceLevelSymbol level={level} />
              {t(`priceLevel.${level}`)}
            </>
          ),
        }))}
      />
      <p className="text-xs text-muted-foreground">
        {t('form.priceLevelHint')}
      </p>
    </div>
  );
}

export default PriceLevelInput;
