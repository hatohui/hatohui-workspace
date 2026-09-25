'use client';

import { useTranslation } from '@hatohui/i18n';
import type { PriceTableRow } from '@/hooks/useCommissionPriceLabels';

export function CommissionPriceTable({ rows }: { rows: PriceTableRow[] }) {
  const { t } = useTranslation('art');

  if (rows.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">
        {t('commission.form.priceListLabel')}
      </p>
      <table className="w-full overflow-hidden rounded-md text-sm ring-1 ring-border">
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-3 py-2 align-top">
                <p className="font-medium">{row.label}</p>
                {row.options.map((option) => (
                  <p key={option.key} className="pl-3 text-muted-foreground">
                    {option.label}
                  </p>
                ))}
              </td>
              <td className="px-3 py-2 text-right align-top tabular-nums">
                <p className="font-medium">{row.price}</p>
                {row.options.map((option) => (
                  <p key={option.key} className="text-muted-foreground">
                    {option.price}
                  </p>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
