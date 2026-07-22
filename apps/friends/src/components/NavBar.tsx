import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import routes from '../constants/routes';

function NavBar() {
  const { t } = useTranslation();

  return (
    <nav className="mb-8 flex items-center justify-between border-b border-border pb-4">
      <Link to={routes.dashboard} className="font-serif text-xl">
        {t('navigation.dashboard')}
      </Link>
      <Button asChild size="sm">
        <Link to={routes.newFriend}>{t('navigation.addFriend')}</Link>
      </Button>
    </nav>
  );
}

export default NavBar;
