'use client';

import { useEffect, useState } from 'react';
import { cn } from '@hatohui/ui';
import { useZoomPan } from '@/hooks/useZoomPan';
import type { ImageViewerCaption as Caption } from '@/hooks/useImageViewer';
import { ImageViewerControls } from './ImageViewerControls';
import { ImageViewerCaption } from './ImageViewerCaption';
import { ImageViewerNavButton } from './ImageViewerNavButton';

export function ImageViewerStage({
  src,
  alt,
  caption,
  originalUrl,
  detailsUrl,
  onPrevious,
  onNext,
  onClose,
}: {
  src: string;
  alt: string;
  caption: Caption;
  originalUrl: string | null;
  detailsUrl: string | null;
  onPrevious?: () => void;
  onNext?: () => void;
  onClose: () => void;
}) {
  const zoom = useZoomPan();
  const [isCaptionOpen, setIsCaptionOpen] = useState(true);
  const hasCaption = Boolean(caption.title || caption.description);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') onPrevious?.();
      else if (event.key === 'ArrowRight') onNext?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onPrevious, onNext]);

  return (
    <div className="relative h-full w-full">
      <div
        className={cn(
          'flex h-full w-full touch-none items-center justify-center overflow-hidden p-4 select-none sm:p-10',
          zoom.isZoomed && 'cursor-grab active:cursor-grabbing',
        )}
        {...zoom.handlers}
        onClick={() => {
          if (zoom.isBackdropClick()) onClose();
        }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{ transform: zoom.transform }}
          className={cn(
            'max-h-full max-w-full object-contain will-change-transform',
            !zoom.isZoomed && 'cursor-zoom-in',
            !zoom.isGesturing && 'transition-transform duration-150 ease-out',
          )}
        />
      </div>
      {hasCaption && isCaptionOpen && !zoom.isZoomed && (
        <ImageViewerCaption caption={caption} />
      )}
      {onPrevious && (
        <ImageViewerNavButton direction="previous" onClick={onPrevious} />
      )}
      {onNext && <ImageViewerNavButton direction="next" onClick={onNext} />}
      <ImageViewerControls
        zoom={zoom}
        originalUrl={originalUrl}
        detailsUrl={detailsUrl}
        onClose={onClose}
        caption={
          hasCaption
            ? {
                isOpen: isCaptionOpen && !zoom.isZoomed,
                toggle: () => setIsCaptionOpen(!isCaptionOpen || zoom.isZoomed),
              }
            : null
        }
      />
    </div>
  );
}
