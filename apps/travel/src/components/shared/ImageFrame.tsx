import { cn } from '@hatohui/ui';
import { ImageOff } from 'lucide-react';
import CautionBadge from './CautionBadge';

interface Props {
  src: string | null;
  alt: string;
  square?: boolean;
  caution?: string[];
}

function ImageFrame({ src, alt, square = false, caution = [] }: Props) {
  const isCaution = caution.length > 0;
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset',
        src
          ? 'bg-card after:ring-black/10 dark:after:ring-white/10'
          : 'bg-foreground/[0.07] after:ring-foreground/30 dark:bg-foreground/[0.09] dark:after:ring-foreground/25',
        square ? 'aspect-square' : 'aspect-[4/3]',
        isCaution && 'ring-[1.5px] ring-amber-500/80',
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-foreground/50">
          <ImageOff className="size-6" aria-hidden />
        </div>
      )}
      <CautionBadge allergens={caution} />
    </div>
  );
}

export default ImageFrame;
