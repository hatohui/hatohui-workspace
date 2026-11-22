'use client';

import {
  ArrowUpRight,
  Download,
  Info,
  Minus,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../button';
import type { ImageViewerLabels, ImageViewerLink } from './image-viewer-types';
import type { useZoomPan } from './use-zoom-pan';

const CONTROL_CLASS =
  'text-white hover:bg-white/15 hover:text-white disabled:opacity-40';

function ImageViewerControls({
  zoom,
  originalUrl,
  detailsUrl,
  onClose,
  caption,
  labels,
  LinkComponent = 'a',
}: {
  zoom: ReturnType<typeof useZoomPan>;
  originalUrl: string | null;
  detailsUrl: string | null;
  onClose: () => void;
  caption: { isOpen: boolean; toggle: () => void } | null;
  labels: ImageViewerLabels;
  LinkComponent?: ImageViewerLink;
}) {
  return (
    <>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={CONTROL_CLASS}
          aria-label={labels.zoomOut}
          disabled={!zoom.isZoomed}
          onClick={zoom.zoomOut}
        >
          <Minus />
        </Button>
        <span className="w-12 text-center text-sm tabular-nums">
          {Math.round(zoom.scale * 100)}%
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={CONTROL_CLASS}
          aria-label={labels.zoomIn}
          disabled={!zoom.canZoomIn}
          onClick={zoom.zoomIn}
        >
          <Plus />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={CONTROL_CLASS}
          aria-label={labels.reset}
          disabled={!zoom.isZoomed}
          onClick={zoom.reset}
        >
          <RotateCcw />
        </Button>
        {caption && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(CONTROL_CLASS, caption.isOpen && 'bg-white/15')}
            aria-label={labels.toggleCaption}
            aria-pressed={caption.isOpen}
            onClick={caption.toggle}
          >
            <Info />
          </Button>
        )}
        {detailsUrl && (
          <Button asChild variant="ghost" size="icon" className={CONTROL_CLASS}>
            <LinkComponent
              href={detailsUrl}
              aria-label={labels.openDetails}
              title={labels.openDetails}
            >
              <ArrowUpRight />
            </LinkComponent>
          </Button>
        )}
        {originalUrl && (
          <Button asChild variant="ghost" size="icon" className={CONTROL_CLASS}>
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              aria-label={labels.download}
              title={labels.download}
            >
              <Download />
            </a>
          </Button>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`absolute top-4 right-4 rounded-full bg-black/60 ${CONTROL_CLASS}`}
        aria-label={labels.close}
        onClick={onClose}
      >
        <X />
      </Button>
    </>
  );
}

export { ImageViewerControls };
