import * as React from 'react';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { computeCropArea, exportCroppedFile } from '../../lib/crop-image';
import { cn } from '../../lib/utils';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Spinner } from './spinner';

export interface CropAspectOption {
  label: string;
  value: number;
}

export interface ImageCropDialogProps {
  open: boolean;
  file: File | null;
  aspect?: number;
  aspectOptions?: CropAspectOption[];
  title?: string;
  hint?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  zoomLabel?: string;
  resetLabel?: string;
  onCancel: () => void;
  onConfirm: (croppedFile: File) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.05;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function ImageCropDialog({
  open,
  file,
  aspect = 1,
  aspectOptions,
  title = 'Crop photo',
  hint = 'Drag to reposition, scroll or use the slider to zoom.',
  cancelLabel = 'Cancel',
  confirmLabel = 'Apply crop',
  zoomLabel = 'Zoom',
  resetLabel = 'Reset',
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [naturalSize, setNaturalSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);
  const [boxSize, setBoxSize] = React.useState<{
    width: number;
    height: number;
  }>({ width: 320, height: 320 });
  const [activeAspect, setActiveAspect] = React.useState(aspect);
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const viewportRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const dragStartRef = React.useRef<{
    pointerX: number;
    pointerY: number;
    originX: number;
    originY: number;
  } | null>(null);

  React.useEffect(() => {
    setActiveAspect(aspect);
  }, [aspect, file]);

  React.useEffect(() => {
    if (!file || !open) {
      setImageUrl(null);
      setNaturalSize(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file, open]);

  React.useEffect(() => {
    const node = viewportRef.current;
    if (!node || !open) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setBoxSize({ width: rect.width, height: rect.height });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [open, activeAspect]);

  const computeBounds = React.useCallback(
    (nextZoom: number) => {
      if (!naturalSize) return { maxX: 0, maxY: 0, renderedW: 0, renderedH: 0 };
      const baseScale = Math.max(
        boxSize.width / naturalSize.width,
        boxSize.height / naturalSize.height,
      );
      const displayScale = baseScale * nextZoom;
      const renderedW = naturalSize.width * displayScale;
      const renderedH = naturalSize.height * displayScale;
      return {
        renderedW,
        renderedH,
        maxX: Math.max(0, (renderedW - boxSize.width) / 2),
        maxY: Math.max(0, (renderedH - boxSize.height) / 2),
      };
    },
    [boxSize.height, boxSize.width, naturalSize],
  );

  const clampOffset = React.useCallback(
    (x: number, y: number, nextZoom: number) => {
      const { maxX, maxY } = computeBounds(nextZoom);
      return {
        x: clamp(x, -maxX, maxX),
        y: clamp(y, -maxY, maxY),
      };
    },
    [computeBounds],
  );

  const updateZoom = React.useCallback(
    (nextZoom: number) => {
      const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
      setZoom(clampedZoom);
      setOffset((current) => clampOffset(current.x, current.y, clampedZoom));
    },
    [clampOffset],
  );

  const handleAspectChange = (nextAspect: number) => {
    setActiveAspect(nextAspect);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!naturalSize) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    const dx = event.clientX - start.pointerX;
    const dy = event.clientY - start.pointerY;
    setOffset(clampOffset(start.originX + dx, start.originY + dy, zoom));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current) {
      dragStartRef.current = null;
      setIsDragging(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.15 : -0.15;
    updateZoom(zoom + delta);
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirm = async () => {
    const image = imageRef.current;
    if (!file || !image || !naturalSize) return;
    setIsExporting(true);
    try {
      const area = computeCropArea({
        naturalWidth: naturalSize.width,
        naturalHeight: naturalSize.height,
        boxWidth: boxSize.width,
        boxHeight: boxSize.height,
        zoom,
        offsetX: offset.x,
        offsetY: offset.y,
      });
      const cropped = await exportCroppedFile(file, image, area);
      onConfirm(cropped);
    } finally {
      setIsExporting(false);
    }
  };

  const { renderedW, renderedH } = computeBounds(zoom);
  const clamped = clampOffset(offset.x, offset.y, zoom);
  const imgLeft = (boxSize.width - renderedW) / 2 + clamped.x;
  const imgTop = (boxSize.height - renderedH) / 2 + clamped.y;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="flex max-h-[92dvh] flex-col gap-4 overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {aspectOptions && aspectOptions.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {aspectOptions.map((option) => {
                const selected = Math.abs(option.value - activeAspect) < 0.01;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handleAspectChange(option.value)}
                    className={cn(
                      'cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      selected
                        ? 'border-primary bg-primary/15 text-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-center">
            <div
              ref={viewportRef}
              style={{ aspectRatio: String(activeAspect) }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              className={cn(
                'relative w-full max-w-[360px] touch-none overflow-hidden rounded-xl border border-border bg-muted/60 select-none',
                isDragging ? 'cursor-grabbing' : 'cursor-grab',
              )}
            >
              {imageUrl && (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt=""
                  draggable={false}
                  onLoad={(event) => {
                    const img = event.currentTarget;
                    setNaturalSize({
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                    });
                  }}
                  style={
                    naturalSize
                      ? {
                          width: `${renderedW}px`,
                          height: `${renderedH}px`,
                          left: `${imgLeft}px`,
                          top: `${imgTop}px`,
                        }
                      : undefined
                  }
                  className={cn(
                    'pointer-events-none absolute max-w-none',
                    !naturalSize && 'opacity-0',
                  )}
                />
              )}

              {/* Subtle rule-of-thirds grid */}
              <div
                aria-hidden
                className={cn(
                  'pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 transition-opacity duration-150',
                  isDragging ? 'opacity-70' : 'opacity-25',
                )}
              >
                <div className="border-r border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div className="border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div className="border-b border-white/60" />
                <div className="border-r border-white/60" />
                <div className="border-r border-white/60" />
                <div />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={zoomLabel}
              onClick={() => updateZoom(zoom - 0.25)}
              disabled={zoom <= MIN_ZOOM}
            >
              <ZoomOut className="size-4" aria-hidden />
            </Button>
            <input
              type="range"
              aria-label={zoomLabel}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={ZOOM_STEP}
              value={zoom}
              onChange={(event) => updateZoom(Number(event.target.value))}
              className="h-1.5 flex-1 cursor-pointer accent-primary"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={zoomLabel}
              onClick={() => updateZoom(zoom + 0.25)}
              disabled={zoom >= MAX_ZOOM}
            >
              <ZoomIn className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={resetLabel}
              title={resetLabel}
              onClick={handleReset}
              disabled={zoom === 1 && offset.x === 0 && offset.y === 0}
            >
              <RotateCcw className="size-3.5" aria-hidden />
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">{hint}</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isExporting}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!naturalSize || isExporting}
          >
            {isExporting && <Spinner />}
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ImageCropDialog };
