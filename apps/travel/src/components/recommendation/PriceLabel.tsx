import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import { useFormatEstimate } from '../../hooks/useFormatEstimate';
import PriceLevelSymbol from './PriceLevelSymbol';

type Price = Pick<
  TravelRecommendationDto,
  'priceMin' | 'priceMax' | 'priceLevel' | 'currency'
>;

function PriceLabel({ price }: { price: Price }) {
  const { t } = useTranslation();
  const format = useFormatEstimate();
  const { priceMin: min, priceMax: max, priceLevel, currency } = price;

  if (min != null) {
    const text =
      max != null && max !== min
        ? t('recommendation.priceRange', {
            min: format(min, currency),
            max: format(max, currency),
          })
        : t('recommendation.priceSingle', { price: format(min, currency) });
    return <span className="text-sm font-medium tabular-nums">{text}</span>;
  }
  if (priceLevel) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium">
        <PriceLevelSymbol level={priceLevel} />
        {t(`priceLevel.${priceLevel}`)}
      </span>
    );
  }
  return (
    <span className="text-sm text-muted-foreground">
      {t('recommendation.noEstimate')}
    </span>
  );
}

export default PriceLabel;
