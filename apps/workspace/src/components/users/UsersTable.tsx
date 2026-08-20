import { useTranslation } from '@hatohui/i18n';
import { listTimezones } from '@hatohui/libs';
import { EditableDataTable, type EditableColumn } from '@hatohui/ui';
import type { AdminUserDto, UpdateAdminUserDto } from '@hatohui/models';
import type {
  AdminSortDirection,
  AdminUserSortOption,
} from '../../constants/admin';

const TIMEZONE_OPTIONS = listTimezones().map((name) => ({
  label: name,
  value: name,
}));

interface UsersTableProps {
  users: AdminUserDto[];
  onCommit: (id: string, key: keyof UpdateAdminUserDto, value: string) => void;
  sortBy: AdminUserSortOption;
  sortDirection: AdminSortDirection;
  onSortChange: (key: AdminUserSortOption) => void;
}

function UsersTable({
  users,
  onCommit,
  sortBy,
  sortDirection,
  onSortChange,
}: UsersTableProps) {
  const { t } = useTranslation('workspace');

  const columns: EditableColumn<AdminUserDto>[] = [
    {
      key: 'name',
      label: t('users.columns.name'),
      editable: true,
      sortable: true,
      size: 180,
    },
    {
      key: 'email',
      label: t('users.columns.email'),
      editable: true,
      sortable: true,
      size: 260,
    },
    {
      key: 'timezone',
      label: t('users.columns.timezone'),
      editable: true,
      sortable: true,
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
      sortable: true,
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
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSortChange={(key) => onSortChange(key as AdminUserSortOption)}
    />
  );
}

export default UsersTable;
