import { useTranslation } from '@hatohui/i18n';
import { useAdminPlaceCategories } from '../../hooks/useAdminPlaceCategories';
import AdminTable from './AdminTable';

function PlaceCategoriesAdmin() {
  const { t } = useTranslation();
  const admin = useAdminPlaceCategories();
  return (
    <AdminTable
      storageKey="travel-admin-place-categories"
      addPlaceholder={t('admin.addPlaceCategories')}
      deleteDescription={t('admin.deletePlaceCategory')}
      {...admin}
    />
  );
}

export default PlaceCategoriesAdmin;
