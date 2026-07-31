import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { useUpcomingFriends } from '../hooks/useUpcomingFriends';
import { useDirectoryControls } from '../hooks/useDirectoryControls';
import { useDirectoryFriends } from '../hooks/useDirectoryFriends';
import BirthdayList from '../components/BirthdayList';
import CalendarView from '../components/CalendarView';
import DirectoryControls from '../components/DirectoryControls';
import WelcomeHero from '../components/WelcomeHero';

function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data, isLoading, isError } = useUpcomingFriends();
  const controls = useDirectoryControls();
  const friends = data?.data ?? [];
  const groups = useDirectoryFriends(
    friends,
    controls.debouncedSearch,
    controls.group,
    controls.direction,
    i18n.language,
  );
  const filteredFriends = groups.flatMap((group) => group.friends);

  if (isAuthLoading) {
    return null;
  }

  if (!user) {
    return <WelcomeHero />;
  }

  return (
    <>
      <h1 className="mb-6 text-3xl">{t('dashboard.title')}</h1>
      {isLoading && (
        <p className="text-muted-foreground">{t('common:loading')}</p>
      )}
      {isError && <p className="text-destructive">{t('common:loadError')}</p>}
      {data && (
        <>
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
          {controls.view === 'timeline' ? (
            <BirthdayList groups={groups} emptyMessage={t('dashboard.empty')} />
          ) : (
            <CalendarView friends={filteredFriends} />
          )}
        </>
      )}
    </>
  );
}

export default DashboardPage;
