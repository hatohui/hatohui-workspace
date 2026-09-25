'use client';

import { useTranslation } from '@hatohui/i18n';
import { Pagination, Skeleton } from '@hatohui/ui';
import { COMMISSION_PAGE_SIZE } from '@/constants/commission';
import { useCommissionRequests } from '@/hooks/useCommissionRequests';
import { CommissionRequestsToolbar } from './CommissionRequestsToolbar';
import { CommissionRequestsTable } from './CommissionRequestsTable';
import { CommissionRequestPanel } from './CommissionRequestPanel';

export function CommissionRequestsView() {
  const { t } = useTranslation('art');
  const requests = useCommissionRequests();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">{t('app.requests.title')}</h1>

      <CommissionRequestsToolbar
        query={requests.query}
        onQueryChange={requests.setQuery}
        status={requests.status}
        onStatusChange={requests.setStatus}
      />

      {requests.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : requests.rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t('app.requests.empty')}
        </p>
      ) : (
        <CommissionRequestsTable
          rows={requests.rows}
          onOpen={requests.select}
        />
      )}

      <CommissionRequestPanel
        id={requests.selectedId}
        onClose={() => requests.select(null)}
      />

      {requests.total > COMMISSION_PAGE_SIZE && (
        <Pagination
          page={requests.page}
          pageSize={COMMISSION_PAGE_SIZE}
          total={requests.total}
          hasMore={requests.hasMore}
          onPageChange={requests.setPage}
          prevLabel={t('app.requests.prev')}
          nextLabel={t('app.requests.next')}
          pageIndicator={(page, total) =>
            t('app.requests.page', { page, total })
          }
        />
      )}
    </div>
  );
}
