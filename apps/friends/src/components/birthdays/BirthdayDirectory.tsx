import type { ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { ErrorState, LoadingDots } from '@hatohui/ui';
import { useUpcomingSections } from '../../hooks/useUpcomingSections';
import { useDirectoryControls } from '../../hooks/useDirectoryControls';
import BirthdayList from './BirthdayList';
import CalendarView from '../calendar/CalendarView';
import DirectoryControls from '../directory/DirectoryControls';

type Props = {
  header: ReactNode;
  emptyMessage: string;
};

function BirthdayDirectory({ header, emptyMessage }: Props) {
  const { t, i18n } = useTranslation();
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

  return (
    <>
      {header}
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
            emptyMessage={emptyMessage}
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

export default BirthdayDirectory;
