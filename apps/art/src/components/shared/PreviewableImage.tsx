'use client';

import { cn } from '@hatohui/ui';
import { useImagePreview } from '@/hooks/useImagePreview';

export function PreviewableImage({
  src,
  alt = '',
  className,
  imageClassName,
}: {
  src: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
}) {
  const openPreview = useImagePreview();
  const image = <img src={src} alt={alt} className={imageClassName} />;

  if (!openPreview)
    return (
      <a href={src} target="_blank" rel="noreferrer" className={className}>
        {image}
      </a>
    );

  return (
    <button
      type="button"
      className={cn('cursor-zoom-in', className)}
      onClick={() => openPreview(src)}
    >
      {image}
    </button>
  );
}
