'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionStepsDto } from '@hatohui/models';
import { Checkbox } from '@hatohui/ui';
import {
  COMMISSION_STEP_KEYS,
  type CommissionStepKey,
} from '@/constants/commission';

export function CommissionStepChecklist({
  steps,
  onToggle,
}: {
  steps: CommissionStepsDto;
  onToggle: (step: CommissionStepKey, done: boolean) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="rounded-lg border border-border p-4">
      <h2 className="mb-2 text-sm font-medium">
        {t('commission.admin.steps.title')}
      </h2>
      <div className="space-y-2">
        {COMMISSION_STEP_KEYS.map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={steps[key] !== null}
              onCheckedChange={(value) => void onToggle(key, value === true)}
            />
            {t(`commission.admin.steps.${key}`)}
          </label>
        ))}
      </div>
    </div>
  );
}
