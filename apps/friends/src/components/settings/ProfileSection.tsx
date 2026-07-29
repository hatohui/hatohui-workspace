import { useTranslation } from '@hatohui/i18n';
import { Avatar } from '@hatohui/ui';
import { useAuth } from '@hatohui/libs';

function ProfileSection() {
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
        <Avatar src={user.avatarUrl} alt={user.name} className="h-10 w-10" />
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('settings.profile.stub')}
      </p>
    </div>
  );
}

export default ProfileSection;
