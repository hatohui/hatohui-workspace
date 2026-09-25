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
import { InfoTooltip } from '@/components/shared/InfoTooltip';
import { CommissionReferenceExamples } from './CommissionReferenceExamples';

export function CommissionTypeSelect({
  form,
  labels,
  artistId,
}: {
  form: ReturnType<typeof useCommissionForm>;
  labels: ReturnType<typeof useCommissionPriceLabels>;
  artistId: string;
}) {
  const { t } = useTranslation('art');
  const { types } = form.pricing;
  const selectedType = types.find(
    (type) => type.id === form.state.commissionTypeId,
  );

  return (
    <div className="space-y-1.5">
      <div className="flex h-4 items-center gap-1.5">
        <Label>{t('commission.form.commissionTypeLabel')}</Label>
        {selectedType && (
          <InfoTooltip
            content={t(`commission.type.${selectedType.key}.description`)}
          />
        )}
      </div>
      <Select
        value={form.state.commissionTypeId}
        onValueChange={(value) => {
          form.update('commissionTypeId', value);
          form.update('optionKey', '');
        }}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={t('commission.form.commissionTypePlaceholder')}
          />
        </SelectTrigger>
        <SelectContent>
          {types.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {labels.typeLabel(type)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <CommissionReferenceExamples
        artistId={artistId}
        tag={selectedType?.tagName ?? undefined}
      />
    </div>
  );
}
