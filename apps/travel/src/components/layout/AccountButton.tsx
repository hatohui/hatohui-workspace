import { useTranslation } from '@hatohui/i18n';
import { Avatar, Button, ConfirmDialog, Skeleton, Spinner } from '@hatohui/ui';
import {
  GoogleIcon,
  useAuth,
  useConfirmLogout,
  useGoogleAuth,
} from '@hatohui/libs';

function AccountButton() {
  const { t } = useTranslation();
  const { user, isLoading, isLoggingIn } = useAuth();
  const login = useGoogleAuth();
  const { confirming, requestLogout, cancelLogout, confirmLogout } =
    useConfirmLogout();

  if (isLoading) return <Skeleton className="size-9 rounded-full" />;

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={isLoggingIn}
        onClick={() => login()}
      >
        {isLoggingIn ? <Spinner /> : <GoogleIcon />}
        <span className="hidden sm:inline">{t('common:auth.login')}</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label={t('common:auth.logout')}
        title={t('common:auth.loggedInAs', { name: user.name })}
        onClick={requestLogout}
      >
        <Avatar src={user.avatarUrl} alt={user.name} className="size-8" />
      </Button>
      <ConfirmDialog
        open={confirming}
        title={t('common:auth.logoutConfirmTitle')}
        description={t('common:auth.logoutConfirmDescription')}
        cancelLabel={t('common:auth.logoutConfirmCancel')}
        confirmLabel={t('common:auth.logoutConfirmSubmit')}
        onCancel={cancelLogout}
        onConfirm={() => void confirmLogout()}
      />
    </>
  );
}

export default AccountButton;
