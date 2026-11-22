import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';

interface Props {
  to: string;
  label: string;
  icon: LucideIcon;
  onNavigate: () => void;
}

function QuickMenuLink({ to, label, icon: Icon, onNavigate }: Props) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Icon className="size-4 text-muted-foreground" aria-hidden />
      {label}
    </Link>
  );
}

export default QuickMenuLink;
