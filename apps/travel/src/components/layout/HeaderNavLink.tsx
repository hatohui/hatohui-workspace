import { NavLink } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import type { NavItem } from '../../constants/navItems';

function HeaderNavLink({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end
      className={({ isActive }) =>
        cn(
          'inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm transition-colors duration-150 motion-reduce:transition-none sm:h-9',
          isActive
            ? 'bg-secondary text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )
      }
    >
      <Icon className="size-4" aria-hidden />
      <span>{t(item.labelKey)}</span>
    </NavLink>
  );
}

export default HeaderNavLink;
