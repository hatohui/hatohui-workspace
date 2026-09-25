'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { Search } from 'lucide-react';
import type { CommissionDtoStatus } from '@hatohui/models';
import {
  COMMISSION_STATUS_OPTIONS,
  REQUESTS_ALL_STATUSES,
} from '@/constants/commission';

export function CommissionRequestsToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  status: CommissionDtoStatus | undefined;
  onStatusChange: (value: CommissionDtoStatus | undefined) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          className="pl-9"
          type="search"
          placeholder={t('app.requests.searchPlaceholder')}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
      <Select
        value={status ?? REQUESTS_ALL_STATUSES}
        onValueChange={(value) =>
          onStatusChange(
            value === REQUESTS_ALL_STATUSES
              ? undefined
              : (value as CommissionDtoStatus),
          )
        }
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={REQUESTS_ALL_STATUSES}>
            {t('app.requests.allStatuses')}
          </SelectItem>
          {COMMISSION_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {t(`commission.status.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
