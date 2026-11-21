import { useTranslation } from '@hatohui/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { useAdminAreas } from '../../hooks/useAdminAreas';
import AdminTable from './AdminTable';

function AreasAdmin() {
  const { t } = useTranslation();
  const admin = useAdminAreas();

  const countrySelect = (
    <Select
      value={admin.targetCountryId}
      onValueChange={admin.setTargetCountryId}
    >
      <SelectTrigger
        className="h-10 sm:w-48"
        aria-label={t('location.country')}
      >
        <SelectValue placeholder={t('location.country')} />
      </SelectTrigger>
      <SelectContent>
        {admin.countryOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <AdminTable
      storageKey="travel-admin-areas"
      addPlaceholder={t('admin.addAreas')}
      deleteDescription={t('admin.deleteArea')}
      addControls={countrySelect}
      {...admin}
    />
  );
}

export default AreasAdmin;
