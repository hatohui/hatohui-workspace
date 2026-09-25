'use client';

import { useTranslation } from '@hatohui/i18n';
import { Checkbox } from '@hatohui/ui';
import { InfoTooltip } from '@/components/shared/InfoTooltip';

export function CommissionVisibilityCheckbox({
  isPublic,
  onChange,
}: {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={isPublic}
          onCheckedChange={(value) => onChange(value === true)}
        />
        {t('commission.form.isPublicLabel')}
      </label>
      <InfoTooltip content={t('commission.form.isPublicTooltip')} />
    </div>
  );
}
