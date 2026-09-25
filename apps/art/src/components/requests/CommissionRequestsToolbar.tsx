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
import type { CommissionsDirection } from '@hatohui/models';
import { COMMISSION_LIST_ORDERS } from '@/constants/commission';

export function CommissionRequestsToolbar({
  query,
  onQueryChange,
  direction,
  onDirectionChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  direction: CommissionsDirection;
  onDirectionChange: (value: CommissionsDirection) => void;
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
        value={direction}
        onValueChange={(value) =>
          onDirectionChange(value as CommissionsDirection)
        }
      >
        <SelectTrigger className="sm:w-44" aria-label={t('app.requests.order')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COMMISSION_LIST_ORDERS.map((order) => (
            <SelectItem key={order} value={order}>
              {t(`app.requests.orders.${order}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
