'use client';

import { useTranslation } from '@hatohui/i18n';
import { Checkbox } from '@hatohui/ui';
import { InfoTooltip } from '@/components/shared/InfoTooltip';

export function CommissionGalleryCheckbox({
  allowGalleryPost,
  privateFee,
  onChange,
}: {
  allowGalleryPost: boolean;
  privateFee: number | null;
  onChange: (allowGalleryPost: boolean) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={allowGalleryPost}
          onCheckedChange={(value) => onChange(value === true)}
        />
        {t('commission.form.allowGalleryPostLabel')}
      </label>
      <InfoTooltip
        content={t(
          privateFee === null
            ? 'commission.form.allowGalleryPostTooltip'
            : 'commission.form.allowGalleryPostFeeTooltip',
        )}
      />
    </div>
  );
}
