import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { Button } from '@hatohui/ui';
import { Settings } from 'lucide-react';
import routes from '../../constants/routes';

function SettingsNavLink() {
  const { t } = useTranslation();
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      aria-label={t('nav.settings')}
      title={t('nav.settings')}
    >
      <Link to={routes.settingsLeave}>
        <Settings className="size-4" aria-hidden />
      </Link>
    </Button>
  );
}

export default SettingsNavLink;
