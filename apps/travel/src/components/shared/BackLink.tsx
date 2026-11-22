import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useBackNavigation } from '../../hooks/useBackNavigation';

interface Props {
  to: string;
  label: string;
}

function BackLink({ to, label }: Props) {
  const goBack = useBackNavigation(to);

  return (
    <Link
      to={to}
      onClick={(event) => {
        event.preventDefault();
        goBack();
      }}
      className="-ml-1 inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {label}
    </Link>
  );
}

export default BackLink;
