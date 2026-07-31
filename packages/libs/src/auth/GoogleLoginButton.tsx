import { useTranslation } from '@hatohui/i18n';
import { Button, Spinner } from '@hatohui/ui';
import { useAuth } from './AuthContext';
import { useGoogleAuth } from './useGoogleAuth';
import GoogleIcon from './GoogleIcon';

export function GoogleLoginButton() {
  const { t } = useTranslation('common');
  const { isLoggingIn } = useAuth();
  const login = useGoogleAuth();

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
