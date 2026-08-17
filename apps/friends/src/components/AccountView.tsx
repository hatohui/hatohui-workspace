import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { Avatar, Button, LoadingDots } from '@hatohui/ui';
import { useAuth } from '@hatohui/libs';
import { navIcons } from '../constants/navIcons';
import routes from '../constants/routes';
import { useMyEntry } from '../hooks/useMyEntry';
import ProfileEntryDetails from './ProfileEntryDetails';
import ProfileSettingsForm from './ProfileSettingsForm';

function AccountView() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { entry, isLoading } = useMyEntry();
  const SettingsIcon = navIcons.settings;
  const LogoutIcon = navIcons.logout;

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('common:errors.unauthorized')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Avatar src={user.avatarUrl} alt={user.name} className="h-14 w-14" />
        {user.isAdmin && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
            {t('account.adminTag')}
          </span>
        )}
      </div>

      <ProfileSettingsForm />

      {isLoading ? (
        <LoadingDots label={t('common:loading')} />
      ) : entry ? (
        <ProfileEntryDetails entry={entry} />
      ) : (
        <p className="text-sm text-muted-foreground">{t('account.stub')}</p>
      )}

      <div className="flex flex-col gap-1 border-t border-border pt-4">
        <Button asChild variant="ghost" className="w-fit justify-start gap-2">
          <Link to={routes.settings}>
            <SettingsIcon className="size-4 shrink-0" />
            {t('navigation.settings')}
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-fit justify-start gap-2 text-destructive hover:text-destructive"
          onClick={() => void logout()}
        >
          <LogoutIcon className="size-4 shrink-0" />
          {t('navigation.logout')}
        </Button>
      </div>
    </div>
  );
}

export default AccountView;
