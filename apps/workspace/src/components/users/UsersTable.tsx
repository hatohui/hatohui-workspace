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

const BOOLEAN_FIELDS = new Set<keyof UpdateAdminUserDto>([
  'isAdmin',
  'isArtist',
]);

interface UsersTableProps {
  users: AdminUserDto[];
  onCommit: (
    id: string,
    key: keyof UpdateAdminUserDto,
    value: string | boolean,
  ) => void;
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

  const BOOLEAN_OPTIONS = [
    { label: t('users.yes'), value: 'true' },
    { label: t('users.no'), value: 'false' },
  ];

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
      editable: true,
      options: BOOLEAN_OPTIONS,
      render: (row) => (row.isAdmin ? t('users.yes') : t('users.no')),
      size: 100,
    },
    {
      key: 'isArtist',
      label: t('users.columns.isArtist'),
      editable: true,
      options: BOOLEAN_OPTIONS,
      render: (row) => (row.isArtist ? t('users.yes') : t('users.no')),
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
      onCommit={(id, key, value) => {
        const typedKey = key as keyof UpdateAdminUserDto;
        onCommit(
          id,
          typedKey,
          BOOLEAN_FIELDS.has(typedKey) ? value === 'true' : value,
        );
      }}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSortChange={(key) => onSortChange(key as AdminUserSortOption)}
    />
  );
}

export default UsersTable;
