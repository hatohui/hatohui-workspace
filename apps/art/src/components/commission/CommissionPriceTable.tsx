'use client';

import { useTranslation } from '@hatohui/i18n';
import type { PriceTableRow } from '@/hooks/useCommissionPriceLabels';

export function CommissionPriceTable({ rows }: { rows: PriceTableRow[] }) {
  const { t } = useTranslation('art');

  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl bg-card/60 px-4 py-3">
      <p className="font-serif text-lg italic">
        {t('commission.form.priceListLabel')}
      </p>
      <div className="mt-2 space-y-2.5 text-sm">
        {rows.map((row) => (
          <div key={row.id}>
            <div className="flex items-baseline gap-2">
              <span className="font-medium">{row.label}</span>
              <span aria-hidden className="menu-leader" />
              <span className="font-serif text-lg leading-none tabular-nums">
                {row.price}
              </span>
            </div>
            {row.options.map((option) => (
              <div
                key={option.key}
                className="flex items-baseline gap-2 pl-3 text-muted-foreground"
              >
                <span>{option.label}</span>
                <span aria-hidden className="menu-leader" />
                <span className="tabular-nums">{option.price}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
