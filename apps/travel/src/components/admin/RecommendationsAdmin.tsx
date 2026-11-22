import { useTranslation } from '@hatohui/i18n';
import { UtensilsCrossed } from 'lucide-react';
import { useAdminRecommendations } from '../../hooks/useAdminRecommendations';
import AddRecommendationButton from '../catalog/AddRecommendationButton';
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
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-48 flex-1">
          <SearchField
            value={admin.search}
            placeholder={t('catalog.searchPlaceholder')}
            onChange={admin.setSearch}
          />
        </div>
        <AddRecommendationButton />
      </div>
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
        <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {admin.recommendations.map((rec) => (
            <AdminRecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </ListState>
      <PaginationBar
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={pagination.setPage}
      />
    </div>
  );
}

export default RecommendationsAdmin;
