import type { LucideIcon } from 'lucide-react';
import { cn } from '@hatohui/ui';

interface Props {
  side: 'left' | 'right';
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

function CarouselButton({ side, label, icon: Icon, onClick }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'absolute top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-background/85 shadow-soft transition-opacity duration-150 focus-visible:opacity-100 motion-reduce:transition-none sm:opacity-0 sm:group-hover:opacity-100',
        side === 'left' ? 'left-2' : 'right-2',
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

export default CarouselButton;
