import { Link } from 'react-router';
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@hatohui/ui';
import { navIcons } from '../../constants/navIcons';
import type { NavLinkItem } from '../../hooks/useNavItems';
import NavBadge from './NavBadge';

interface Props extends NavLinkItem {
  expanded: boolean;
}

function NavItem({ to, label, icon, active, expanded, badge = 0 }: Props) {
  const Icon = navIcons[icon];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          asChild
          variant={active ? 'default' : 'ghost'}
          size={expanded ? 'sm' : 'icon'}
          className={`relative rounded-full ${expanded ? 'w-full justify-start gap-2 rounded-lg px-3' : ''}`}
          aria-label={label}
        >
          <Link to={to}>
            <Icon className="size-4 shrink-0" />
            {expanded && <span className="text-sm">{label}</span>}
            <NavBadge count={badge} />
          </Link>
        </Button>
      </TooltipTrigger>
      {!expanded && (
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

export default NavItem;
