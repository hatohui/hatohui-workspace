'use client';

import type { useCommissionForm } from '@/hooks/useCommissionForm';
import { useCommissionPriceLabels } from '@/hooks/useCommissionPriceLabels';
import { CommissionPriceTable } from './CommissionPriceTable';
import { CommissionTypeSelect } from './CommissionTypeSelect';
import { CommissionOptionSelect } from './CommissionOptionSelect';
import { CommissionAddonChecklist } from './CommissionAddonChecklist';

export function CommissionTypeFields({
  form,
  artistId,
}: {
  form: ReturnType<typeof useCommissionForm>;
  artistId: string;
}) {
  const labels = useCommissionPriceLabels(form.pricing);

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <CommissionPriceTable rows={labels.rows} />
      <CommissionTypeSelect form={form} labels={labels} artistId={artistId} />
      <CommissionOptionSelect form={form} labels={labels} />
      <CommissionAddonChecklist form={form} labels={labels} />
    </div>
  );
}
