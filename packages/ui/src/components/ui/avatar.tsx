import { cn } from '../../lib/utils';

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
};

function Avatar({ src, alt, className }: Props) {
  return (
    <div
      className={cn(
        'flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground',
        className,
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs uppercase">{alt.slice(0, 2)}</span>
      )}
    </div>
  );
}

export { Avatar };
