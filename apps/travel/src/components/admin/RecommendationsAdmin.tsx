import { useTranslation } from '@hatohui/i18n';
import { Skeleton } from '@hatohui/ui';
import { UtensilsCrossed } from 'lucide-react';
import { useAdminRecommendations } from '../../hooks/useAdminRecommendations';
import RecommendationDialog from '../recommendation/RecommendationDialog';
import EmptyState from '../shared/EmptyState';
import SearchField from '../shared/SearchField';
import DeleteRowDialog from './DeleteRowDialog';
import RecommendationAdminRow from './RecommendationAdminRow';

function RecommendationsAdmin() {
  const { t } = useTranslation();
  const admin = useAdminRecommendations();

  return (
    <div className="space-y-4">
      <SearchField
        value={admin.search}
        placeholder={t('admin.searchPlaceholder')}
        onChange={admin.setSearch}
        suggestions={admin.suggestions}
      />
      {admin.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : admin.items.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} message={t('catalog.empty')} />
      ) : (
        <div className="space-y-2">
          {admin.items.map((rec) => (
            <RecommendationAdminRow
              key={rec.id}
              recommendation={rec}
              onEdit={() => admin.edit(rec)}
              onDelete={() =>
                admin.deletion.request({
                  id: rec.id,
                  name: `${rec.dish.name} — ${rec.place.name}`,
                  recommendation: rec,
                })
              }
            />
          ))}
        </div>
      )}
      <RecommendationDialog
        key={admin.editDialog.version}
        state={admin.editDialog}
        recommendation={admin.editing ?? undefined}
      />
      <DeleteRowDialog
        name={admin.deletion.pending?.name ?? null}
        description={t('admin.deleteRecommendation')}
        onConfirm={() => void admin.deletion.confirm()}
        onCancel={admin.deletion.cancel}
      />
    </div>
  );
}

export default RecommendationsAdmin;
