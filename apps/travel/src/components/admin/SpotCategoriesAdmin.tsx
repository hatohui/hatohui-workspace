import { useTranslation } from '@hatohui/i18n';
import { useAdminSpotCategories } from '../../hooks/useAdminSpotCategories';
import AdminTable from './AdminTable';

function SpotCategoriesAdmin() {
  const { t } = useTranslation();
  const admin = useAdminSpotCategories();
  return (
    <AdminTable
      storageKey="travel-admin-spot-categories"
      addPlaceholder={t('admin.addSpotCategories')}
      deleteDescription={t('admin.deleteSpotCategory')}
      {...admin}
    />
  );
}

export default SpotCategoriesAdmin;
