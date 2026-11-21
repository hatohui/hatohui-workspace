import { useTranslation } from '@hatohui/i18n';
import { useFormatEstimate } from '../../hooks/useFormatEstimate';

interface Props {
  estimate: number | null;
  currency: string;
}

function EstimateLabel({ estimate, currency }: Props) {
  const { t } = useTranslation();
  const format = useFormatEstimate();
  if (estimate == null) {
    return (
      <span className="text-sm text-muted-foreground">
        {t('recommendation.noEstimate')}
      </span>
    );
  }
  return (
    <span className="text-sm font-medium tabular-nums">
      {t('recommendation.estimate', { price: format(estimate, currency) })}
    </span>
  );
}

export default EstimateLabel;
