'use client';

import { Dialog, DialogContent, DialogTitle } from '../dialog';
import { ImageViewerStage } from './image-viewer-stage';
import {
  DEFAULT_IMAGE_VIEWER_LABELS,
  type ImageViewerCaption,
  type ImageViewerLabels,
  type ImageViewerLink,
} from './image-viewer-types';

function ImageViewer({
  src,
  alt,
  caption = {},
  originalUrl = null,
  detailsUrl = null,
  onPrevious,
  onNext,
  onClose,
  labels,
  LinkComponent,
}: {
  src: string | null;
  alt: string;
  caption?: ImageViewerCaption;
  originalUrl?: string | null;
  detailsUrl?: string | null;
  onPrevious?: () => void;
  onNext?: () => void;
  onClose: () => void;
  labels?: Partial<ImageViewerLabels>;
  LinkComponent?: ImageViewerLink;
}) {
  const mergedLabels: ImageViewerLabels = {
    ...DEFAULT_IMAGE_VIEWER_LABELS,
    ...labels,
  };

  return (
    <Dialog open={src !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="top-0 left-0 z-[60] block h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-black/90 p-0 text-white shadow-none sm:max-w-none"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {src && (
          <ImageViewerStage
            key={src}
            src={src}
            alt={alt}
            caption={caption}
            originalUrl={originalUrl}
            detailsUrl={detailsUrl}
            onPrevious={onPrevious}
            onNext={onNext}
            onClose={onClose}
            labels={mergedLabels}
            LinkComponent={LinkComponent}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export { ImageViewer };
