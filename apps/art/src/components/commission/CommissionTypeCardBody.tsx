'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { Plus } from 'lucide-react';
import { useCommissionOptionPricingAdmin } from '@/hooks/useCommissionPricingAdmin';
import { CommissionOptionPriceLine } from './CommissionOptionPriceLine';
import { CommissionOptionsTable } from './CommissionOptionsTable';

const DEFAULT_OPTION_LABEL = 'Default';

export function CommissionTypeCardBody({
  commissionTypeId,
  typeLabel,
}: {
  commissionTypeId: string;
  typeLabel: string;
}) {
  const { t } = useTranslation('art');
  const { items, create, update } =
    useCommissionOptionPricingAdmin(commissionTypeId);

  if (items.length >= 2) {
    return <CommissionOptionsTable commissionTypeId={commissionTypeId} />;
  }

  const addVariant = async () => {
    const first = items[0];
    if (first && first.label === DEFAULT_OPTION_LABEL) {
      await update({
        id: first.id,
        data: {
          commissionTypeId,
          label: typeLabel,
          priceMode: first.priceMode,
          minPrice: first.minPrice,
          maxPrice: first.maxPrice ?? undefined,
        },
      });
    }
    if (!first) {
      await create({
        data: {
          commissionTypeId,
          label: typeLabel,
          priceMode: 'FIXED',
          minPrice: 0,
        },
      });
    }
    await create({
      data: {
        commissionTypeId,
        label: t('app.commissionSettings.newVariant'),
        priceMode: 'FIXED',
        minPrice: 0,
      },
    });
  };

  return (
    <div className="space-y-3">
      <CommissionOptionPriceLine commissionTypeId={commissionTypeId} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() => void addVariant()}
      >
        <Plus className="size-4" aria-hidden />
        {t('app.commissionSettings.addVariant')}
      </Button>
    </div>
  );
}
