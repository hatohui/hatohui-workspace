import { Cake } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { useUpcomingFriends } from '../../hooks/useUpcomingFriends';
import { useDirectoryControls } from '../../hooks/useDirectoryControls';
import { useDirectoryFriends } from '../../hooks/useDirectoryFriends';
import BirthdayList from '../../components/BirthdayList';
import CalendarView from '../../components/CalendarView';
import DirectoryControls from '../../components/DirectoryControls';

function BirthdaysPage() {
  const { t, i18n } = useTranslation();
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

  return (
    <>
      <h1 className="mb-6 flex items-center gap-2 text-3xl">
        <Cake className="size-7 shrink-0" />
        {t('dashboard.title')}
      </h1>
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
            <BirthdayList groups={groups} emptyMessage={t('birthdays.empty')} />
          ) : (
            <CalendarView friends={filteredFriends} />
          )}
        </>
      )}
    </>
  );
}

export default BirthdaysPage;
