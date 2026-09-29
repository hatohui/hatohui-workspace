'use client';

import { PreviewableImage } from '@/components/shared/PreviewableImage';

export function OrderPostImages({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {images.map((url) => (
        <PreviewableImage
          key={url}
          src={url}
          className="block"
          imageClassName="aspect-square w-full rounded-lg object-cover"
        />
      ))}
    </div>
  );
}
