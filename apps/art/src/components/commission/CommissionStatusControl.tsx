'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionDtoStatus } from '@hatohui/models';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from '@hatohui/ui';
import { COMMISSION_KANBAN_COLUMNS } from '@/constants/commission';

export function CommissionStatusControl({
  status,
  onChange,
}: {
  status: CommissionDtoStatus;
  onChange: (status: CommissionDtoStatus) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="max-w-xs">
      <Label>{t('commission.admin.detail.status')}</Label>
      <Select
        value={status}
        onValueChange={(value) => void onChange(value as CommissionDtoStatus)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COMMISSION_KANBAN_COLUMNS.map((option) => (
            <SelectItem key={option} value={option}>
              {t(`commission.status.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
