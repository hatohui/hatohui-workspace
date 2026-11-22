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
        'relative w-full overflow-hidden rounded-lg bg-card',
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
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <ImageOff className="size-6" aria-hidden />
        </div>
      )}
      <CautionBadge allergens={caution} />
    </div>
  );
}

export default ImageFrame;
