import { useTranslation } from '@hatohui/i18n';
import RequireAuth from '../../components/RequireAuth';
import ProfileView from '../../components/ProfileView';

function ProfilePage() {
  const { t } = useTranslation();

  return (
    <RequireAuth>
      <h1 className="mb-6 text-3xl">{t('profile.title')}</h1>
      <ProfileView />
    </RequireAuth>
  );
}

export default ProfilePage;
