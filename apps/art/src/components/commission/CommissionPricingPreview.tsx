'use client';

import { useTranslation } from '@hatohui/i18n';
import { useCommissionPricingEstimate } from '@/hooks/useCommissionPricingEstimate';
import { useCommissionPriceLabels } from '@/hooks/useCommissionPriceLabels';
import { CommissionPriceTable } from './CommissionPriceTable';

export function CommissionPricingPreview({ artistId }: { artistId: string }) {
  const { t } = useTranslation('art');
  const pricing = useCommissionPricingEstimate(
    artistId,
    undefined,
    undefined,
    [],
  );
  const { rows } = useCommissionPriceLabels(pricing);

  return (
    <section className="space-y-3 rounded-lg border border-border p-4">
      <h2 className="text-sm font-medium text-muted-foreground">
        {t('app.commissionSettings.previewTitle')}
      </h2>
      {rows.length > 0 ? (
        <CommissionPriceTable rows={rows} />
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('app.commissionSettings.previewEmpty')}
        </p>
      )}
    </section>
  );
}
