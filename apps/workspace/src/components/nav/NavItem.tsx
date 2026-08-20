import { NavLink } from 'react-router';
import { Tooltip, TooltipContent, TooltipTrigger, cn } from '@hatohui/ui';
import { navIcons, type NavIconKey } from '../../constants/navIcons';

interface NavItemProps {
  to: string;
  label: string;
  icon: NavIconKey;
  collapsed: boolean;
  end?: boolean;
}

function NavItem({ to, label, icon, collapsed, end }: NavItemProps) {
  const Icon = navIcons[icon];

  const link = (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
          collapsed && 'justify-center px-2',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export default NavItem;
