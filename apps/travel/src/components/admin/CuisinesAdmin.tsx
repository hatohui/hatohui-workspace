import { useTranslation } from '@hatohui/i18n';
import { useAdminCuisines } from '../../hooks/useAdminCuisines';
import AdminTable from './AdminTable';

function CuisinesAdmin() {
  const { t } = useTranslation();
  const admin = useAdminCuisines();
  return (
    <AdminTable
      storageKey="travel-admin-cuisines"
      addPlaceholder={t('admin.addCuisines')}
      deleteDescription={t('admin.deleteCuisine')}
      {...admin}
    />
  );
}

export default CuisinesAdmin;
