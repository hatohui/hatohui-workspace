import { cn } from '../../lib/utils';

type Props = {
  label?: string;
  className?: string;
};

function LoadingDots({ label = 'Loading', className }: Props) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center gap-1.5', className)}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className="animate-loading-dot size-2 rounded-full bg-primary"
          style={{ animationDelay: `${(i * 160).toString()}ms` }}
        />
      ))}
    </span>
  );
}

export { LoadingDots };
