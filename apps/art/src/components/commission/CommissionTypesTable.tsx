'use client';

import { useTranslation } from '@hatohui/i18n';
import { Switch } from '@hatohui/ui';
import { useCommissionTypesAdmin } from '@/hooks/useCommissionTypesAdmin';
import { CommissionOptionsTable } from './CommissionOptionsTable';

export function CommissionTypesTable() {
  const { t } = useTranslation('art');
  const { items, setEnabled } = useCommissionTypesAdmin();

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-border rounded-md border border-border">
        {items.map((item) => (
          <li
            key={item.commissionTypeId}
            className="flex items-center justify-between p-3"
          >
            <span className="font-medium">{item.label}</span>
            <Switch
              checked={item.enabled}
              onCheckedChange={(checked) =>
                void setEnabled({
                  id: item.commissionTypeId,
                  data: { active: checked, no: item.no },
                })
              }
            />
          </li>
        ))}
      </ul>
      <div className="space-y-6">
        {items
          .filter((item) => item.enabled)
          .map((item) => (
            <section key={item.commissionTypeId}>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                {t('commission.admin.pricing.optionsTable.optionsFor', {
                  type: item.label,
                })}
              </h3>
              <CommissionOptionsTable
                commissionTypeId={item.commissionTypeId}
              />
            </section>
          ))}
      </div>
    </div>
  );
}
