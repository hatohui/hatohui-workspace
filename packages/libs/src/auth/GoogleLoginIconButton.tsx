import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { useGoogleIdentity } from './useGoogleIdentity';
import GoogleIcon from './GoogleIcon';

export function GoogleLoginIconButton() {
  const { t } = useTranslation('common');
  const { isReady, promptLogin } = useGoogleIdentity();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="rounded-full"
      disabled={!isReady}
      onClick={promptLogin}
      aria-label={t('auth.login')}
    >
      <GoogleIcon />
    </Button>
  );
}
