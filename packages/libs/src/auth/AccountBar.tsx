import { useTranslation } from '@hatohui/i18n';
import { Avatar, Button, ConfirmDialog, Spinner } from '@hatohui/ui';
import { useAuth } from './AuthContext';
import { useConfirmLogout } from './useConfirmLogout';
import { useGoogleAuth } from './useGoogleAuth';
import GoogleIcon from './GoogleIcon';

export function AccountBar() {
  const { t } = useTranslation('common');
  const { user, isLoading, isLoggingIn } = useAuth();
  const { confirming, requestLogout, cancelLogout, confirmLogout } =
    useConfirmLogout();
  const login = useGoogleAuth();

  if (isLoading) return null;

  if (!user) {
    return (
      <Button
        type="button"
        variant="outline"
        disabled={isLoggingIn}
        onClick={() => login()}
      >
        {isLoggingIn ? <Spinner /> : <GoogleIcon />}
        {t('auth.login')}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar
        src={user.avatarUrl}
        alt={user.name}
        className="size-6 shrink-0"
      />
      <span className="text-sm text-muted-foreground">
        {t('auth.loggedInAs', { name: user.name })}
      </span>
      <Button
        type="button"
        variant="ghost"
        className="text-destructive hover:text-destructive"
        onClick={requestLogout}
      >
        {t('auth.logout')}
      </Button>
      <ConfirmDialog
        open={confirming}
        title={t('auth.logoutConfirmTitle')}
        description={t('auth.logoutConfirmDescription')}
        cancelLabel={t('auth.logoutConfirmCancel')}
        confirmLabel={t('auth.logoutConfirmSubmit')}
        onCancel={cancelLogout}
        onConfirm={() => void confirmLogout()}
      />
    </div>
  );
}
