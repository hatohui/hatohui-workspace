import { ImageOff } from 'lucide-react';

interface Props {
  src: string | null;
  alt: string;
}

function ImageFrame({ src, alt }: Props) {
  return (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-card">
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="size-full object-cover"
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
