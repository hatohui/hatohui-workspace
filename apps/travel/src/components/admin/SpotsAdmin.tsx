import { useTranslation } from '@hatohui/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { useAdminSpots } from '../../hooks/useAdminSpots';
import AdminTable from './AdminTable';

const NONE_VALUE = '__none__';

function SpotsAdmin() {
  const { t } = useTranslation();
  const { targetAreaId, setTargetAreaId, areaOptions, ...admin } =
    useAdminSpots();

  const areaSelect = (
    <Select
      value={targetAreaId || NONE_VALUE}
      onValueChange={(next) => setTargetAreaId(next === NONE_VALUE ? '' : next)}
    >
      <SelectTrigger className="h-10 sm:w-52" aria-label={t('admin.area')}>
        <SelectValue placeholder={t('admin.area')} />
      </SelectTrigger>
      <SelectContent>
        {areaOptions.map((option) => (
          <SelectItem
            key={option.value || NONE_VALUE}
            value={option.value || NONE_VALUE}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <AdminTable
      storageKey="travel-admin-spots"
      addPlaceholder={t('admin.addSpots')}
      deleteDescription={t('admin.deleteSpot')}
      addControls={areaSelect}
      {...admin}
    />
  );
}

export default SpotsAdmin;
