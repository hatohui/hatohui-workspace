'use client';

import { Dialog, DialogContent, DialogTitle } from '@hatohui/ui';
import type { ImageViewerCaption } from '@/hooks/useImageViewer';
import { ImageViewerStage } from './ImageViewerStage';

export function ImageViewer({
  src,
  alt,
  caption = {},
  onClose,
}: {
  src: string | null;
  alt: string;
  caption?: ImageViewerCaption;
  onClose: () => void;
}) {
  return (
    <Dialog open={src !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="top-0 left-0 block h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-black/90 p-0 text-white shadow-none sm:max-w-none"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {src && (
          <ImageViewerStage
            key={src}
            src={src}
            alt={alt}
            caption={caption}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
