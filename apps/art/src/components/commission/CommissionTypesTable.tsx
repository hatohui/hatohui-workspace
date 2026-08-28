'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { cn, Switch } from '@hatohui/ui';
import { useCommissionTypesAdmin } from '@/hooks/useCommissionTypesAdmin';
import { CommissionOptionsTable } from './CommissionOptionsTable';

export function CommissionTypesTable() {
  const { t } = useTranslation('art');
  const { items, setEnabled } = useCommissionTypesAdmin();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Falls back to the first type until the visitor picks one explicitly —
  // derived at render time rather than synced via effect, since it's just
  // a function of `items` and `selectedId`.
  const selected =
    items.find((item) => item.commissionTypeId === selectedId) ?? items[0];

  return (
    <div className="flex gap-6">
      <ul className="w-64 shrink-0 divide-y divide-border rounded-md border border-border">
        {items.map((item) => (
          <li key={item.commissionTypeId}>
            <div
              className={cn(
                'flex items-center justify-between gap-2 p-3',
                item.commissionTypeId === selected?.commissionTypeId &&
                  'bg-accent',
              )}
            >
              <button
                type="button"
                onClick={() => setSelectedId(item.commissionTypeId)}
                className="min-w-0 flex-1 truncate text-left font-medium"
              >
                {item.label}
              </button>
              <Switch
                checked={item.enabled}
                onCheckedChange={(checked) =>
                  void setEnabled({
                    id: item.commissionTypeId,
                    data: { active: checked, no: item.no },
                  })
                }
              />
            </div>
          </li>
        ))}
      </ul>
      <section className="min-w-0 flex-1">
        {selected && (
          <>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              {t('commission.admin.pricing.optionsTable.optionsFor', {
                type: selected.label,
              })}
            </h3>
            <CommissionOptionsTable
              commissionTypeId={selected.commissionTypeId}
            />
          </>
        )}
      </section>
    </div>
  );
}
