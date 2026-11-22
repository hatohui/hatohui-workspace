import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { ThemeToggle } from '@hatohui/libs';
import { Compass } from 'lucide-react';
import { NAV_ITEMS } from '../../constants/navItems';
import routes from '../../constants/routes';
import LocationPicker from '../location/LocationPicker';
import AccountButton from './AccountButton';
import AdminNavLink from './AdminNavLink';
import HeaderNavLink from './HeaderNavLink';
import NotificationsBell from './NotificationsBell';
import SettingsNavLink from './SettingsNavLink';

function TravelHeader() {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
        <Link
          to={routes.catalog}
          className="mr-auto inline-flex shrink-0 items-center gap-2 font-medium tracking-tight md:mr-2"
        >
          <Compass className="size-5 text-primary" aria-hidden />
          <span>{t('brand')}</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <HeaderNavLink key={item.to} item={item} />
          ))}
        </nav>
        <LocationPicker />
        <div className="hidden md:flex">
          <AdminNavLink />
        </div>
        <NotificationsBell />
        <SettingsNavLink />
        <ThemeToggle />
        <AccountButton />
      </div>
    </header>
  );
}

export default TravelHeader;
