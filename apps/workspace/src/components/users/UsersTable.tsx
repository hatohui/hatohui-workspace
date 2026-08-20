import { useTranslation } from '@hatohui/i18n';
import { listTimezones } from '@hatohui/libs';
import { EditableDataTable, type EditableColumn } from '@hatohui/ui';
import type { AdminUserDto, UpdateAdminUserDto } from '@hatohui/models';

const TIMEZONE_OPTIONS = listTimezones().map((name) => ({
  label: name,
  value: name,
}));

interface UsersTableProps {
  users: AdminUserDto[];
  onCommit: (id: string, key: keyof UpdateAdminUserDto, value: string) => void;
}

function UsersTable({ users, onCommit }: UsersTableProps) {
  const { t } = useTranslation('workspace');

  const columns: EditableColumn<AdminUserDto>[] = [
    { key: 'name', label: t('users.columns.name'), editable: true, size: 180 },
    {
      key: 'email',
      label: t('users.columns.email'),
      editable: true,
      size: 260,
    },
    {
      key: 'timezone',
      label: t('users.columns.timezone'),
      editable: true,
      options: TIMEZONE_OPTIONS,
      selectPlaceholder: t('users.selectPlaceholder'),
      searchPlaceholder: t('users.searchOptionPlaceholder'),
      emptyLabel: t('users.noMatches'),
      size: 220,
    },
    {
      key: 'onboardingStatus',
      label: t('users.columns.onboardingStatus'),
      editable: false,
      size: 140,
    },
    {
      key: 'isAdmin',
      label: t('users.columns.isAdmin'),
      editable: false,
      render: (row) => (row.isAdmin ? 'Yes' : 'No'),
      size: 100,
    },
    {
      key: 'createdAt',
      label: t('users.columns.createdAt'),
      editable: false,
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
      size: 140,
    },
  ];

  return (
    <EditableDataTable
      columns={columns}
      rows={users}
      storageKey="users"
      onCommit={(id, key, value) =>
        onCommit(id, key as keyof UpdateAdminUserDto, value)
      }
    />
  );
}

export default UsersTable;
