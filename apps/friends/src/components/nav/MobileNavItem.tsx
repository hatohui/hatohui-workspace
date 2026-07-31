import { Link } from 'react-router';
import { navIcons, type NavIconKey } from '../../constants/navIcons';

interface Props {
  to?: string;
  label: string;
  icon: NavIconKey;
  active?: boolean;
  onClick?: () => void;
}

function MobileNavItem({ to, label, icon, active, onClick }: Props) {
  const Icon = navIcons[icon];
  const className = `flex size-10 shrink-0 items-center justify-center rounded-full transition-colors ${
    active
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:text-foreground'
  }`;

  if (to) {
    return (
      <Link to={to} aria-label={label} className={className}>
        <Icon className="size-[18px] shrink-0" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={className}
    >
      <Icon className="size-[18px] shrink-0" />
    </button>
  );
}

export default MobileNavItem;
