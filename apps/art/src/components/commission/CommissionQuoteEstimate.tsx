'use client';

import { useTranslation } from '@hatohui/i18n';
import type { useCommissionPricingEstimate } from '@/hooks/useCommissionPricingEstimate';
import { useCommissionPriceLabels } from '@/hooks/useCommissionPriceLabels';

export function CommissionQuoteEstimate({
  pricing,
}: {
  pricing: ReturnType<typeof useCommissionPricingEstimate>;
}) {
  const { t } = useTranslation('art');
  const { money } = useCommissionPriceLabels(pricing);

  if (pricing.estimate === null || pricing.estimateMode === null) return null;

  const value =
    pricing.estimateMode === 'range' && pricing.estimateHigh != null
      ? t('commission.form.estimateRange', {
          low: money(pricing.estimate),
          high: money(pricing.estimateHigh),
        })
      : pricing.estimateMode === 'from'
        ? t('commission.form.estimateFrom', {
            price: money(pricing.estimate),
          })
        : money(pricing.estimate);

  return (
    <p className="text-sm text-muted-foreground">
      {t('commission.form.estimateLabel')}: {value}
      {pricing.isRush && pricing.rushFee && (
        <span>
          {' ('}
          {t('commission.form.rushFeeIncluded', {
            amount: money(pricing.rushFee.feeAmount),
            days: pricing.rushFee.thresholdDays,
          })}
          {')'}
        </span>
      )}
    </p>
  );
}
