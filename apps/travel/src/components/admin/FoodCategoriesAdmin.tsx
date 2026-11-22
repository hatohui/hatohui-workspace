import { useTranslation } from '@hatohui/i18n';
import { useAdminFoodCategories } from '../../hooks/useAdminFoodCategories';
import AdminTable from './AdminTable';

function FoodCategoriesAdmin() {
  const { t } = useTranslation();
  const admin = useAdminFoodCategories();
  return (
    <AdminTable
      storageKey="travel-admin-food-categories"
      addPlaceholder={t('admin.addFoodCategories')}
      deleteDescription={t('admin.deleteFoodCategory')}
      {...admin}
    />
  );
}

export default FoodCategoriesAdmin;
