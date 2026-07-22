import { useTranslation } from '@hatohui/i18n';
import { useUpcomingFriends } from '../hooks/useUpcomingFriends';
import BirthdayList from '../components/BirthdayList';

function DashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useUpcomingFriends();

  return (
    <>
      <h1 className="mb-6 text-3xl">{t('dashboard.title')}</h1>
      {isLoading && (
        <p className="text-muted-foreground">{t('common:loading')}</p>
      )}
      {isError && <p className="text-destructive">{t('common:loadError')}</p>}
      {data && <BirthdayList friends={data.data} />}
    </>
  );
}

export default DashboardPage;
