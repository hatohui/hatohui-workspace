'use client';

import type { useCommissionForm } from '@/hooks/useCommissionForm';
import type { CommissionValidation } from '@/hooks/useCommissionValidation';
import { useCommissionPriceLabels } from '@/hooks/useCommissionPriceLabels';
import { CommissionPriceTable } from './CommissionPriceTable';
import { CommissionTypeSelect } from './CommissionTypeSelect';
import { CommissionOptionSelect } from './CommissionOptionSelect';
import { CommissionAddonChecklist } from './CommissionAddonChecklist';
import { CommissionDeadlineField } from './CommissionDeadlineField';

export function CommissionTypeFields({
  form,
  validation,
}: {
  form: ReturnType<typeof useCommissionForm>;
  validation: CommissionValidation;
}) {
  const labels = useCommissionPriceLabels(form.pricing);

  return (
    <div className="space-y-4">
      <CommissionPriceTable rows={labels.rows} />
      <CommissionTypeSelect form={form} labels={labels} />
      <CommissionOptionSelect form={form} labels={labels} />
      <CommissionAddonChecklist form={form} labels={labels} />
      <CommissionDeadlineField form={form} validation={validation} />
    </div>
  );
}
