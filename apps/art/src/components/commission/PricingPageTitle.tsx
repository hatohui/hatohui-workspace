'use client';

import { useTranslation } from '@hatohui/i18n';

export function PricingPageTitle() {
  const { t } = useTranslation('art');
  return (
    <h1 className="font-serif text-3xl">
      {t('commission.admin.pricing.title')}
    </h1>
  );
}
