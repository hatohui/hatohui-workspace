import { Navigate } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { LoadingDots } from '@hatohui/ui';
import { useMyEntry } from '../../hooks/useMyEntry';
import AddMyselfButton from '../../components/AddMyselfButton';
import RequireAuth from '../../components/RequireAuth';
import routes from '../../constants/routes';

function ProfilePage() {
  const { t } = useTranslation();
  const { entry, isLoading } = useMyEntry();

  return (
    <RequireAuth>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingDots label={t('common:loading')} />
        </div>
      ) : entry ? (
        <Navigate to={routes.friend(entry.handle ?? entry.id)} replace />
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">{t('profile.notAdded')}</p>
          <AddMyselfButton />
        </div>
      )}
    </RequireAuth>
  );
}

export default ProfilePage;
