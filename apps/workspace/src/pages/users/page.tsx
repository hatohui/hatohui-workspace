import { useTranslation } from '@hatohui/i18n';
import { Spinner } from '@hatohui/ui';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import UsersTable from '../../components/users/UsersTable';
import UsersFilters from '../../components/users/UsersFilters';
import UsersPagination from '../../components/users/UsersPagination';
import { ADMIN_USERS_PAGE_SIZE } from '../../constants/admin';

function UsersPage() {
  const { t } = useTranslation('workspace');
  const admin = useAdminUsers();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t('users.title')}</h1>
      <UsersFilters
        search={admin.search}
        onSearchChange={admin.setSearch}
        onboardingStatus={admin.onboardingStatus}
        onOnboardingStatusChange={admin.setOnboardingStatus}
        sort={admin.sort}
        onSortChange={admin.setSort}
        direction={admin.direction}
        onDirectionChange={admin.setDirection}
      />
      {admin.isLoading ? (
        <Spinner />
      ) : (
        <UsersTable users={admin.users} onCommit={admin.updateField} />
      )}
      <UsersPagination
        page={admin.page}
        pageSize={ADMIN_USERS_PAGE_SIZE}
        total={admin.total}
        hasMore={admin.hasMore}
        onPageChange={admin.setPage}
      />
    </div>
  );
}

export default UsersPage;
