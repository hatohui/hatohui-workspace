'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import type { useCommissionPriceLabels } from '@/hooks/useCommissionPriceLabels';

export function CommissionOptionSelect({
  form,
  labels,
}: {
  form: ReturnType<typeof useCommissionForm>;
  labels: ReturnType<typeof useCommissionPriceLabels>;
}) {
  const { t } = useTranslation('art');
  const { optionsForType } = form.pricing;

  if (optionsForType.length <= 1) return null;

  return (
    <div className="space-y-1.5">
      <Label>{t('commission.form.optionLabel')}</Label>
      <Select
        value={form.state.optionKey}
        onValueChange={(value) => form.update('optionKey', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('commission.form.optionPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {optionsForType.map((option) => (
            <SelectItem key={option.key} value={option.key}>
              {labels.optionLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
