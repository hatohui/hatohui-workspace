import { useTranslation } from '@hatohui/i18n';
import { Button, Spinner } from '@hatohui/ui';
import { useAuth } from './AuthContext';
import { useGoogleAuth } from './useGoogleAuth';
import GoogleIcon from './GoogleIcon';

export function GoogleLoginIconButton() {
  const { t } = useTranslation('common');
  const { isLoggingIn } = useAuth();
  const login = useGoogleAuth();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="rounded-full"
      disabled={isLoggingIn}
      onClick={() => login()}
      aria-label={t('auth.login')}
    >
      {isLoggingIn ? <Spinner /> : <GoogleIcon />}
    </Button>
  );
}
