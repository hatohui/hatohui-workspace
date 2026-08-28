'use client';

import { useTranslation } from '@hatohui/i18n';
import { CommissionTypesTable } from './CommissionTypesTable';
import { CommissionAddonPricingSection } from './CommissionAddonPricingSection';
import { CommissionRushFeeSection } from './CommissionRushFeeSection';

export function CommissionSettings({ artistId }: { artistId: string }) {
  const { t } = useTranslation('art');

  return (
    <div className="space-y-10">
      <header className="max-w-2xl space-y-1">
        <h1 className="font-serif text-2xl">
          {t('app.commissionSettings.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('app.commissionSettings.subtitle')}
        </p>
      </header>

      <section className="space-y-3">
        <div className="max-w-2xl space-y-1">
          <h2 className="font-medium">{t('app.commissionSettings.types')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('app.commissionSettings.typesHint')}
          </p>
        </div>
        <CommissionTypesTable />
      </section>

      <CommissionAddonPricingSection />
      <CommissionRushFeeSection artistId={artistId} />
    </div>
  );
}
