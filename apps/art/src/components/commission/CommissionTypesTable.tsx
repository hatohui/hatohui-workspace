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
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      <ul className="w-full shrink-0 divide-y divide-border overflow-hidden rounded-md border border-border md:w-64">
        {items.map((item) => {
          const isSelected =
            item.commissionTypeId === selected?.commissionTypeId;
          return (
            <li key={item.commissionTypeId}>
              <div
                className={cn(
                  'flex items-center justify-between gap-2 border-l-2 border-transparent p-3 transition-colors duration-150 ease-out motion-reduce:transition-none',
                  isSelected
                    ? 'border-primary bg-accent'
                    : 'hover:bg-accent/50',
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(item.commissionTypeId)}
                  className={cn(
                    'min-w-0 flex-1 cursor-pointer truncate rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected
                      ? 'font-semibold'
                      : 'font-medium text-muted-foreground',
                  )}
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
          );
        })}
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
