'use client';

import { useTranslation } from '@hatohui/i18n';
import type { useCommissionPricingEstimate } from '@/hooks/useCommissionPricingEstimate';

export function CommissionQuoteEstimate({
  pricing,
}: {
  pricing: ReturnType<typeof useCommissionPricingEstimate>;
}) {
  const { t } = useTranslation('art');

  if (pricing.estimateCents === null) return null;

  return (
    <p className="text-sm text-muted-foreground">
      {t('commission.form.estimateLabel')}: $
      {(pricing.estimateCents / 100).toFixed(2)}
      {pricing.isRush && pricing.rushFee && (
        <span>
          {' ('}
          {t('commission.form.rushFeeIncluded', {
            amount: (pricing.rushFee.feeCents / 100).toFixed(0),
            days: pricing.rushFee.thresholdDays,
          })}
          {')'}
        </span>
      )}
    </p>
  );
}
