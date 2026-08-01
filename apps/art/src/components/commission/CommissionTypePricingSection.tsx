'use client';

import { useTranslation } from '@hatohui/i18n';
import { useCommissionTypePricingAdmin } from '@/hooks/useCommissionPricingAdmin';
import { CommissionTypePriceRow } from './CommissionTypePriceRow';

export function CommissionTypePricingSection() {
  const { t } = useTranslation('art');
  const pricing = useCommissionTypePricingAdmin();

  return (
    <section>
      <h2 className="mb-2 font-medium">
        {t('commission.form.commissionTypeLabel')}
      </h2>
      <ul className="space-y-1">
        {pricing.items.map((item) => (
          <CommissionTypePriceRow
            key={item.id}
            item={item}
            onSave={(basePriceCents) =>
              pricing.update({
                id: item.id,
                data: { type: item.type, basePriceCents },
              })
            }
          />
        ))}
      </ul>
    </section>
  );
}
