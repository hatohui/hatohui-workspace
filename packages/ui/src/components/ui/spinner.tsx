import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type Props = {
  label?: string;
  className?: string;
};

function Spinner({ label = 'Loading', className }: Props) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn(
        'size-4 animate-spin text-primary motion-reduce:animate-none',
        className,
      )}
    />
  );
}

export { Spinner };
