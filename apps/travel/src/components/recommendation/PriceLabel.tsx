import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDishDto } from '@hatohui/models';
import { useFormatEstimate } from '../../hooks/useFormatEstimate';
import PriceLevelSymbol from './PriceLevelSymbol';

type Price = Pick<
  TravelRecommendationDishDto,
  'priceMin' | 'priceMax' | 'priceLevel'
> & { currency: string };

function PriceLabel({ price }: { price: Price }) {
  const { t } = useTranslation();
  const format = useFormatEstimate();
  const { priceMin: min, priceMax: max, priceLevel, currency } = price;

  if (min != null) {
    const text =
      max != null && max !== min
        ? `${format(min, currency)}–${format(max, currency)}`
        : format(min, currency);
    return <span className="text-sm font-medium tabular-nums">{text}</span>;
  }
  if (priceLevel) {
    return (
      <span
        className="inline-flex text-foreground"
        role="img"
        aria-label={t(`priceLevel.${priceLevel}`)}
        title={t(`priceLevel.${priceLevel}`)}
      >
        <PriceLevelSymbol level={priceLevel} />
      </span>
    );
  }
  return null;
}

export default PriceLabel;
