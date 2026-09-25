'use client';

import { useTranslation } from '@hatohui/i18n';
import { Checkbox, Label } from '@hatohui/ui';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import type { useCommissionPriceLabels } from '@/hooks/useCommissionPriceLabels';

export function CommissionAddonChecklist({
  form,
  labels,
}: {
  form: ReturnType<typeof useCommissionForm>;
  labels: ReturnType<typeof useCommissionPriceLabels>;
}) {
  const { t } = useTranslation('art');
  const { addons } = form.pricing;
  const { addonKeys } = form.state;

  if (addons.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <Label>{t('commission.form.addonsLabel')}</Label>
      <div className="space-y-2">
        {addons.map((addon) => (
          <label key={addon.key} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={addonKeys.includes(addon.key)}
              onCheckedChange={(value) =>
                form.update(
                  'addonKeys',
                  value === true
                    ? [...addonKeys, addon.key]
                    : addonKeys.filter((key) => key !== addon.key),
                )
              }
            />
            {labels.addonLabel(addon)}
          </label>
        ))}
      </div>
    </div>
  );
}
