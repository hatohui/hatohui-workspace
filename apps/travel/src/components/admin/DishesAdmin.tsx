import { useTranslation } from '@hatohui/i18n';
import { useAdminDishes } from '../../hooks/useAdminDishes';
import AdminTable from './AdminTable';

function DishesAdmin() {
  const { t } = useTranslation();
  const admin = useAdminDishes();
  return (
    <AdminTable
      storageKey="travel-admin-dishes"
      addPlaceholder={t('admin.addDishes')}
      deleteDescription={t('admin.deleteDish')}
      {...admin}
    />
  );
}

export default DishesAdmin;
