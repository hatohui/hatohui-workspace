'use client';

import { Download, Info, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, cn } from '@hatohui/ui';
import type { useZoomPan } from '@/hooks/useZoomPan';

const CONTROL_CLASS =
  'text-white hover:bg-white/15 hover:text-white disabled:opacity-40';

export function ImageViewerControls({
  zoom,
  originalUrl,
  onClose,
  caption,
}: {
  zoom: ReturnType<typeof useZoomPan>;
  originalUrl: string | null;
  onClose: () => void;
  caption: { isOpen: boolean; toggle: () => void } | null;
}) {
  const { t } = useTranslation('art');

  return (
    <>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={CONTROL_CLASS}
          aria-label={t('imageViewer.zoomOut')}
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
          aria-label={t('imageViewer.zoomIn')}
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
          aria-label={t('imageViewer.reset')}
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
            aria-label={t('imageViewer.toggleCaption')}
            aria-pressed={caption.isOpen}
            onClick={caption.toggle}
          >
            <Info />
          </Button>
        )}
        {originalUrl && (
          <Button asChild variant="ghost" size="icon" className={CONTROL_CLASS}>
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              aria-label={t('imageViewer.download')}
              title={t('imageViewer.download')}
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
        aria-label={t('imageViewer.close')}
        onClick={onClose}
      >
        <X />
      </Button>
    </>
  );
}
