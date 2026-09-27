'use client';

import { useState } from 'react';
import { cn } from '@hatohui/ui';
import { useZoomPan } from '@/hooks/useZoomPan';
import type { ImageViewerCaption as Caption } from '@/hooks/useImageViewer';
import { ImageViewerControls } from './ImageViewerControls';
import { ImageViewerCaption } from './ImageViewerCaption';

export function ImageViewerStage({
  src,
  alt,
  caption,
  onClose,
}: {
  src: string;
  alt: string;
  caption: Caption;
  onClose: () => void;
}) {
  const zoom = useZoomPan();
  const [isCaptionOpen, setIsCaptionOpen] = useState(true);
  const hasCaption = Boolean(caption.title || caption.description);

  return (
    <div className="relative h-full w-full">
      <div
        className={cn(
          'flex h-full w-full touch-none items-center justify-center overflow-hidden p-4 select-none sm:p-10',
          zoom.isZoomed
            ? 'cursor-grab active:cursor-grabbing'
            : 'cursor-zoom-in',
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
            !zoom.isGesturing && 'transition-transform duration-150 ease-out',
          )}
        />
      </div>
      {hasCaption && isCaptionOpen && !zoom.isZoomed && (
        <ImageViewerCaption caption={caption} />
      )}
      <ImageViewerControls
        zoom={zoom}
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
