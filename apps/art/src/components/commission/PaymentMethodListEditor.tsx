'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, Input } from '@hatohui/ui';
import { Plus, X } from 'lucide-react';

export interface PaymentMethodDraft {
  name: string;
  instructions: string;
}

export function PaymentMethodListEditor({
  methods,
  onChange,
}: {
  methods: PaymentMethodDraft[];
  onChange: (methods: PaymentMethodDraft[]) => void;
}) {
  const { t } = useTranslation('art');

  const update = (index: number, patch: Partial<PaymentMethodDraft>) =>
    onChange(methods.map((m, i) => (i === index ? { ...m, ...patch } : m)));

  return (
    <div className="space-y-2">
      {methods.map((method, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-md border border-border p-2 sm:flex-row sm:items-center"
        >
          <Input
            className="sm:w-40"
            placeholder={t(
              'app.commissionSettings.paymentMethodNamePlaceholder',
            )}
            value={method.name}
            onChange={(event) => update(index, { name: event.target.value })}
          />
          <Input
            className="flex-1"
            placeholder={t(
              'app.commissionSettings.paymentMethodInstructionsPlaceholder',
            )}
            value={method.instructions}
            onChange={(event) =>
              update(index, { instructions: event.target.value })
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t('app.commissionSettings.paymentMethodRemove')}
            onClick={() => onChange(methods.filter((_, i) => i !== index))}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...methods, { name: '', instructions: '' }])}
      >
        <Plus className="size-4" aria-hidden />
        {t('app.commissionSettings.paymentMethodAdd')}
      </Button>
    </div>
  );
}
