import { cn } from '@hatohui/ui';
import { ImageOff } from 'lucide-react';

interface Props {
  src: string | null;
  alt: string;
  square?: boolean;
}

function ImageFrame({ src, alt, square = false }: Props) {
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-xl bg-card',
        square ? 'aspect-square' : 'aspect-[4/3]',
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
    </div>
  );
}

export default ImageFrame;
