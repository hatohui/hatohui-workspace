import { useTranslation } from '@hatohui/i18n';
import { UtensilsCrossed } from 'lucide-react';
import { useAdminRecommendations } from '../../hooks/useAdminRecommendations';
import ListState from '../shared/ListState';
import PaginationBar from '../shared/PaginationBar';
import SearchField from '../shared/SearchField';
import AdminRecommendationCard from './AdminRecommendationCard';

function RecommendationsAdmin() {
  const { t } = useTranslation();
  const admin = useAdminRecommendations();
  const { pagination } = admin;

  return (
    <div className="space-y-5">
      <SearchField
        value={admin.search}
        placeholder={t('catalog.searchPlaceholder')}
        onChange={admin.setSearch}
      />
      <ListState
        isLoading={admin.isLoading}
        isError={admin.isError}
        isEmpty={!admin.recommendations.length}
        onRetry={() => void admin.refetch()}
        emptyIcon={UtensilsCrossed}
        emptyMessage={t(
          admin.isFiltered ? 'catalog.emptyFiltered' : 'catalog.empty',
        )}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {admin.recommendations.map((rec) => (
            <AdminRecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </ListState>
      <PaginationBar
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        totalPages={pagination.totalPages}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}

export default RecommendationsAdmin;
