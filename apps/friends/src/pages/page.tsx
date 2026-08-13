import { Link } from 'react-router';
import { UserPlus } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { Button, ErrorState, LoadingDots } from '@hatohui/ui';
import { useUpcomingSections } from '../hooks/useUpcomingSections';
import { useDirectoryControls } from '../hooks/useDirectoryControls';
import BirthdayList from '../components/BirthdayList';
import CalendarView from '../components/CalendarView';
import DirectoryControls from '../components/DirectoryControls';
import WelcomeHero from '../components/WelcomeHero';
import routes from '../constants/routes';

function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const controls = useDirectoryControls();
  const {
    groups,
    isLoading,
    isError,
    hasMore,
    isFetchingMore,
    loadMore,
    refetch,
  } = useUpcomingSections(
    controls.debouncedSearch,
    controls.group,
    controls.direction,
    i18n.language,
  );

  if (isAuthLoading) {
    return null;
  }

  if (!user) {
    return <WelcomeHero />;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-3xl">{t('dashboard.title')}</h1>
        <Button asChild variant="outline">
          <Link to={routes.newFriend} className="flex items-center gap-2">
            <UserPlus className="size-4 shrink-0" />
            {t('navigation.addFriend')}
          </Link>
        </Button>
      </div>
      <DirectoryControls
        view={controls.view}
        onViewChange={controls.setView}
        search={controls.search}
        onSearchChange={controls.setSearch}
        group={controls.group}
        onGroupChange={controls.setGroup}
        direction={controls.direction}
        onToggleDirection={controls.toggleDirection}
      />
      {isLoading && (
        <div className="flex justify-center py-8">
          <LoadingDots label={t('common:loading')} />
        </div>
      )}
      {isError && (
        <ErrorState
          message={t('common:loadError')}
          retry={{ label: t('common:retry'), onClick: () => void refetch() }}
        />
      )}
      {!isLoading &&
        !isError &&
        (controls.view === 'timeline' ? (
          <BirthdayList
            groups={groups}
            emptyMessage={t('dashboard.empty')}
            hasMore={hasMore}
            isFetchingMore={isFetchingMore}
            loadingMoreMessage={t('dashboard.loadingMore')}
            onLoadMore={loadMore}
          />
        ) : (
          <CalendarView search={controls.debouncedSearch} />
        ))}
    </>
  );
}

export default DashboardPage;
