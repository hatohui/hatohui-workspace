import { useTranslation } from '@hatohui/i18n';
import { Spinner } from '@hatohui/ui';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import UsersTable from '../../components/users/UsersTable';

function UsersPage() {
  const { t } = useTranslation('workspace');
  const { users, isLoading, updateField } = useAdminUsers();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t('users.title')}</h1>
      {isLoading ? (
        <Spinner />
      ) : (
        <UsersTable users={users} onCommit={updateField} />
      )}
    </div>
  );
}

export default UsersPage;
