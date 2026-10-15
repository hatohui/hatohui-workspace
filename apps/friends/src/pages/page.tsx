import { Link } from 'react-router';
import { UserPlus } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { Button } from '@hatohui/ui';
import BirthdayDirectory from '../components/birthdays/BirthdayDirectory';
import WelcomeHero from '../components/home/WelcomeHero';
import routes from '../constants/routes';

function DashboardPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <WelcomeHero />;
  }

  return (
    <BirthdayDirectory
      header={
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl">{t('dashboard.title')}</h1>
          <Button asChild variant="outline">
            <Link to={routes.newFriend} className="flex items-center gap-2">
              <UserPlus className="size-4 shrink-0" />
              {t('navigation.addFriend')}
            </Link>
          </Button>
        </div>
      }
      emptyMessage={t('dashboard.empty')}
    />
  );
}

export default DashboardPage;
