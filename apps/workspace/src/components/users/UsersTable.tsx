import { useTranslation } from '@hatohui/i18n';
import { listTimezones } from '@hatohui/libs';
import { EditableDataTable, type EditableColumn } from '@hatohui/ui';
import type { AdminUserDto, UpdateAdminUserDto } from '@hatohui/models';

const ONBOARDING_OPTIONS = ['PENDING', 'COMPLETED', 'SKIPPED'].map(
  (status) => ({ label: status, value: status }),
);

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
    {
      key: 'name',
      label: t('users.columns.name'),
      editable: true,
      width: '18%',
    },
    {
      key: 'email',
      label: t('users.columns.email'),
      editable: true,
      width: '26%',
    },
    {
      key: 'timezone',
      label: t('users.columns.timezone'),
      editable: true,
      options: TIMEZONE_OPTIONS,
      width: '18%',
    },
    {
      key: 'onboardingStatus',
      label: t('users.columns.onboardingStatus'),
      editable: true,
      options: ONBOARDING_OPTIONS,
      width: '14%',
    },
    {
      key: 'isAdmin',
      label: t('users.columns.isAdmin'),
      editable: false,
      render: (row) => (row.isAdmin ? 'Yes' : 'No'),
      width: '10%',
    },
    {
      key: 'createdAt',
      label: t('users.columns.createdAt'),
      editable: false,
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
      width: '14%',
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
