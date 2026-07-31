import { useTranslation } from '@hatohui/i18n';
import { Avatar } from '@hatohui/ui';
import { useAuth } from '@hatohui/libs';

function ProfileView() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('common:errors.unauthorized')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar src={user.avatarUrl} alt={user.name} className="h-14 w-14" />
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{t('profile.stub')}</p>
    </div>
  );
}

export default ProfileView;
