import { useTranslation } from '@hatohui/i18n';
import { Pagination, Spinner } from '@hatohui/ui';
import { useAdminProfiles } from '../../hooks/useAdminProfiles';
import ProfilesTable from '../../components/profiles/ProfilesTable';
import ProfilesFilters from '../../components/profiles/ProfilesFilters';
import { ADMIN_PROFILES_PAGE_SIZE } from '../../constants/admin';

function ProfilesPage() {
  const { t } = useTranslation('workspace');
  const admin = useAdminProfiles();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t('profiles.title')}</h1>
      <ProfilesFilters search={admin.search} onSearchChange={admin.setSearch} />
      {admin.isLoading ? (
        <Spinner />
      ) : (
        <ProfilesTable
          profiles={admin.profiles}
          onCommit={admin.updateField}
          sortBy={admin.sort}
          sortDirection={admin.direction}
          onSortChange={admin.onHeaderSort}
        />
      )}
      <Pagination
        page={admin.page}
        pageSize={ADMIN_PROFILES_PAGE_SIZE}
        total={admin.total}
        hasMore={admin.hasMore}
        onPageChange={admin.setPage}
        prevLabel={t('users.prevPage')}
        nextLabel={t('users.nextPage')}
        pageIndicator={(page, total) =>
          t('users.pageIndicator', { page, total })
        }
      />
    </div>
  );
}

export default ProfilesPage;
