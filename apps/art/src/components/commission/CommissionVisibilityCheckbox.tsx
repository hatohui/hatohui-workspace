'use client';

import { Info } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Checkbox, Tooltip, TooltipContent, TooltipTrigger } from '@hatohui/ui';

export function CommissionVisibilityCheckbox({
  isPublic,
  onChange,
}: {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox
        checked={isPublic}
        onCheckedChange={(value) => onChange(value === true)}
      />
      {t('commission.form.isPublicLabel')}
      <Tooltip>
        <TooltipTrigger type="button">
          <Info className="size-4 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>{t('commission.form.isPublicTooltip')}</TooltipContent>
      </Tooltip>
    </label>
  );
}
