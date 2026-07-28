import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { GoogleLoginButton, useAuth } from '@hatohui/libs';
import routes from '../constants/routes';
import LanguageSwitcher from './LanguageSwitcher';

function NavBar() {
  const { t } = useTranslation();
  const { user, isLoading, logout } = useAuth();

  return (
    <nav className="mb-8 flex items-center justify-between border-b border-border pb-4">
      <Link to={routes.dashboard} className="font-serif text-xl">
        {t('navigation.dashboard')}
      </Link>
      <div className="flex items-center gap-4">
        <Button asChild size="sm">
          <Link to={routes.newFriend}>{t('navigation.addFriend')}</Link>
        </Button>
        {!isLoading &&
          (user ? (
            <Button size="sm" variant="outline" onClick={() => void logout()}>
              {t('navigation.logout')}
            </Button>
          ) : (
            <GoogleLoginButton />
          ))}
        <LanguageSwitcher />
      </div>
    </nav>
  );
}

export default NavBar;
