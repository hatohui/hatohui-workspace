'use client';

import { useTranslation } from '@hatohui/i18n';
import type { useCommissionPricingEstimate } from '@/hooks/useCommissionPricingEstimate';

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function CommissionQuoteEstimate({
  pricing,
}: {
  pricing: ReturnType<typeof useCommissionPricingEstimate>;
}) {
  const { t } = useTranslation('art');

  if (pricing.estimate === null || pricing.estimateMode === null) return null;

  const value =
    pricing.estimateMode === 'range' && pricing.estimateHigh != null
      ? t('commission.form.estimateRange', {
          low: dollars(pricing.estimate),
          high: dollars(pricing.estimateHigh),
        })
      : pricing.estimateMode === 'from'
        ? t('commission.form.estimateFrom', {
            price: dollars(pricing.estimate),
          })
        : dollars(pricing.estimate);

  return (
    <p className="text-sm text-muted-foreground">
      {t('commission.form.estimateLabel')}: {value}
      {pricing.isRush && pricing.rushFee && (
        <span>
          {' ('}
          {t('commission.form.rushFeeIncluded', {
            amount: (pricing.rushFee.feeAmount / 100).toFixed(0),
            days: pricing.rushFee.thresholdDays,
          })}
          {')'}
        </span>
      )}
    </p>
  );
}
