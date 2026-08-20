import { useTranslation } from '@hatohui/i18n';
import { EditableDataTable, type EditableColumn } from '@hatohui/ui';
import {
  AdminProfileDtoVisibility,
  type AdminProfileDto,
  type UpdateAdminProfileDto,
} from '@hatohui/models';

const VISIBILITY_OPTIONS = Object.values(AdminProfileDtoVisibility).map(
  (value) => ({ label: value, value }),
);

interface ProfilesTableProps {
  profiles: AdminProfileDto[];
  onCommit: (
    id: string,
    key: keyof UpdateAdminProfileDto,
    value: string,
  ) => void;
  sortBy: 'name' | 'createdAt';
  sortDirection: 'asc' | 'desc';
  onSortChange: (key: 'name' | 'createdAt') => void;
}

function ProfilesTable({
  profiles,
  onCommit,
  sortBy,
  sortDirection,
  onSortChange,
}: ProfilesTableProps) {
  const { t } = useTranslation('workspace');

  const hasBirthday = (row: AdminProfileDto) =>
    row.birthMonth !== null && row.birthDay !== null;

  const columns: EditableColumn<AdminProfileDto>[] = [
    {
      key: 'name',
      label: t('profiles.columns.name'),
      editable: true,
      sortable: true,
      size: 200,
    },
    {
      key: 'handle',
      label: t('profiles.columns.handle'),
      editable: true,
      size: 160,
    },
    {
      key: 'birthYear',
      label: t('profiles.columns.birthYear'),
      editable: hasBirthday,
      size: 110,
    },
    {
      key: 'birthMonth',
      label: t('profiles.columns.birthMonth'),
      editable: hasBirthday,
      size: 110,
    },
    {
      key: 'birthDay',
      label: t('profiles.columns.birthDay'),
      editable: hasBirthday,
      size: 100,
    },
    {
      key: 'visibility',
      label: t('profiles.columns.visibility'),
      editable: hasBirthday,
      options: VISIBILITY_OPTIONS,
      size: 160,
    },
    {
      key: 'isAssociated',
      label: t('profiles.columns.isAssociated'),
      editable: false,
      render: (row) => (row.isAssociated ? 'Yes' : 'No'),
      size: 100,
    },
    {
      key: 'createdAt',
      label: t('profiles.columns.createdAt'),
      editable: false,
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
      size: 140,
    },
  ];

  return (
    <EditableDataTable
      columns={columns}
      rows={profiles}
      storageKey="profiles"
      onCommit={(id, key, value) =>
        onCommit(id, key as keyof UpdateAdminProfileDto, value)
      }
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSortChange={(key) => onSortChange(key as 'name' | 'createdAt')}
    />
  );
}

export default ProfilesTable;
