import { useTranslation } from '@hatohui/i18n';
import { EditableDataTable, type EditableColumn } from '@hatohui/ui';
import type { AdminUserDto, UpdateAdminUserDto } from '@hatohui/models';

const ONBOARDING_OPTIONS = ['PENDING', 'COMPLETED', 'SKIPPED'].map(
  (status) => ({ label: status, value: status }),
);

interface UsersTableProps {
  users: AdminUserDto[];
  onCommit: (id: string, key: keyof UpdateAdminUserDto, value: string) => void;
}

function UsersTable({ users, onCommit }: UsersTableProps) {
  const { t } = useTranslation('workspace');

  const columns: EditableColumn<AdminUserDto>[] = [
    { key: 'name', label: t('users.columns.name'), editable: true },
    { key: 'email', label: t('users.columns.email'), editable: true },
    { key: 'timezone', label: t('users.columns.timezone'), editable: true },
    {
      key: 'onboardingStatus',
      label: t('users.columns.onboardingStatus'),
      editable: true,
      options: ONBOARDING_OPTIONS,
    },
    {
      key: 'isAdmin',
      label: t('users.columns.isAdmin'),
      editable: false,
      render: (row) => (row.isAdmin ? 'Yes' : 'No'),
    },
    {
      key: 'createdAt',
      label: t('users.columns.createdAt'),
      editable: false,
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <EditableDataTable
      columns={columns}
      rows={users}
      onCommit={(id, key, value) =>
        onCommit(id, key as keyof UpdateAdminUserDto, value)
      }
    />
  );
}

export default UsersTable;
