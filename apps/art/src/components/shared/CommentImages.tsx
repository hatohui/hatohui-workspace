'use client';

import { PreviewableImage } from './PreviewableImage';

export function CommentImages({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {images.map((url) => (
        <PreviewableImage
          key={url}
          src={url}
          className="block size-20 overflow-hidden rounded-md"
          imageClassName="size-full object-cover"
        />
      ))}
    </div>
  );
}
