'use client';

import { useTranslation } from '@hatohui/i18n';
import { COMMISSION_KANBAN_COLUMNS } from '@/constants/commission';
import { useCommissionsKanban } from '@/hooks/useCommissionsKanban';
import { KanbanColumn } from './KanbanColumn';

export function KanbanBoard() {
  const { t } = useTranslation('art');
  const { columns, isLoading } = useCommissionsKanban();

  return (
    <div>
      <h1 className="mb-4 font-serif text-3xl">
        {t('commission.admin.production.title')}
      </h1>
      {isLoading ? (
        <p className="text-muted-foreground">{t('common:loading')}</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COMMISSION_KANBAN_COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              items={columns.get(status) ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
