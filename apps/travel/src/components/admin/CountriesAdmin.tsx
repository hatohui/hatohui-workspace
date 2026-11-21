import { useTranslation } from '@hatohui/i18n';
import { useAdminCountries } from '../../hooks/useAdminCountries';
import AdminTable from './AdminTable';

function CountriesAdmin() {
  const { t } = useTranslation();
  const admin = useAdminCountries();
  return (
    <AdminTable
      storageKey="travel-admin-countries"
      addPlaceholder={t('admin.addCountries')}
      deleteDescription={t('admin.deleteCountry')}
      {...admin}
    />
  );
}

export default CountriesAdmin;
