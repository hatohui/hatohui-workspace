import { NavLink } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import AccountMenu from './AccountMenu';

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.dashboard' },
  { to: '/users', labelKey: 'nav.users' },
] as const;

function Sidebar() {
  const { t } = useTranslation('workspace');

  return (
    <nav className="flex h-screen w-48 flex-col border-r border-border">
      <div className="flex flex-1 flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            {t(item.labelKey)}
          </NavLink>
        ))}
      </div>
      <AccountMenu />
    </nav>
  );
}

export default Sidebar;
