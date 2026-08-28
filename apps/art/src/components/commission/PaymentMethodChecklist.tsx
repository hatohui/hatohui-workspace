'use client';

import { useTranslation } from '@hatohui/i18n';
import { Checkbox, Label } from '@hatohui/ui';
import type { PaymentMethodDto } from '@hatohui/models';

export function PaymentMethodChecklist({
  methods,
  selected,
  onToggle,
}: {
  methods: PaymentMethodDto[];
  selected: string[];
  onToggle: (key: string, checked: boolean) => void;
}) {
  const { t } = useTranslation('art');

  if (methods.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('app.commissionSettings.paymentMethodsEmpty')}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {methods.map((method) => (
        <Label
          key={method.key}
          htmlFor={`pm-${method.key}`}
          className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-normal"
        >
          <Checkbox
            id={`pm-${method.key}`}
            checked={selected.includes(method.key)}
            onCheckedChange={(checked) =>
              onToggle(method.key, checked === true)
            }
          />
          {method.name}
        </Label>
      ))}
    </div>
  );
}
