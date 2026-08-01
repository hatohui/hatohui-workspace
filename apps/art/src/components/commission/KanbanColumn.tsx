'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionDto, CommissionDtoStatus } from '@hatohui/models';
import { KanbanCard } from './KanbanCard';

export function KanbanColumn({
  status,
  items,
}: {
  status: CommissionDtoStatus;
  items: CommissionDto[];
}) {
  const { t } = useTranslation('art');

  return (
    <div className="w-64 shrink-0 rounded-lg bg-card p-3">
      <h2 className="mb-2 text-sm font-medium">
        {t(`commission.status.${status}`)} ({items.length})
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <KanbanCard key={item.id} commission={item} />
        ))}
      </div>
    </div>
  );
}
