import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { useGoogleIdentity } from './useGoogleIdentity';
import GoogleIcon from './GoogleIcon';

export function GoogleLoginButton() {
  const { t } = useTranslation('common');
  const { isReady, promptLogin } = useGoogleIdentity();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={!isReady}
      onClick={promptLogin}
    >
      <GoogleIcon />
      {t('auth.login')}
    </Button>
  );
}
