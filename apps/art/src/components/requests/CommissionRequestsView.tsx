'use client';

import { useTranslation } from '@hatohui/i18n';
import { Pagination, Skeleton } from '@hatohui/ui';
import {
  COMMISSION_PAGE_SIZE,
  type CommissionListView,
} from '@/constants/commission';
import { useCommissionRequests } from '@/hooks/useCommissionRequests';
import { useQuoteDialog } from '@/hooks/useQuoteDialog';
import { ClientPanel } from '@/components/clients/ClientPanel';
import { CommissionRequestsToolbar } from './CommissionRequestsToolbar';
import { CommissionRequestsTable } from './CommissionRequestsTable';
import { CommissionRequestPanel } from './CommissionRequestPanel';
import { QuoteDialog } from './QuoteDialog';

export function CommissionRequestsView({ view }: { view: CommissionListView }) {
  const { t } = useTranslation('art');
  const requests = useCommissionRequests(view);
  const quote = useQuoteDialog();

  return (
    <div className="space-y-4">
      <CommissionRequestsToolbar
        query={requests.query}
        onQueryChange={requests.setQuery}
        direction={requests.direction}
        onDirectionChange={requests.setDirection}
      />

      {requests.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : requests.rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t(`app.commissions.empty.${view}`)}
        </p>
      ) : (
        <CommissionRequestsTable
          rows={requests.rows}
          columns={requests.columns}
          onOpen={requests.select}
          onOpenClient={requests.openClient}
          onAccept={(row) => quote.open(row.quoteTarget, 'accept')}
        />
      )}

      <CommissionRequestPanel
        id={requests.selectedId}
        onClose={() => requests.select(null)}
      />
      <QuoteDialog dialog={quote} />
      <ClientPanel
        clientId={requests.clientId}
        onClose={() => requests.openClient(null)}
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
