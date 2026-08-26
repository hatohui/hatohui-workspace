'use client';

import { useTranslation } from '@hatohui/i18n';
import { CommissionTypesTable } from './CommissionTypesTable';
import { CommissionOptionPricingSection } from './CommissionOptionPricingSection';
import { CommissionAddonPricingSection } from './CommissionAddonPricingSection';
import { CommissionRushFeeSection } from './CommissionRushFeeSection';

export function CommissionSettings({ artistId }: { artistId: string }) {
  const { t } = useTranslation('art');

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl">
        {t('app.commissionSettings.title')}
      </h1>
      <section>
        <h2 className="mb-2 font-medium">
          {t('commission.form.commissionTypeLabel')}
        </h2>
        <CommissionTypesTable artistId={artistId} />
      </section>
      <CommissionOptionPricingSection />
      <CommissionAddonPricingSection />
      <CommissionRushFeeSection artistId={artistId} />
    </div>
  );
}
