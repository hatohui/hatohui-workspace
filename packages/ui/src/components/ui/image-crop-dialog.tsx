import * as React from 'react';
import { RotateCcw, Shrink, ZoomIn, ZoomOut } from 'lucide-react';
import {
  computeCropLayout,
  coverScale,
  exportCroppedFile,
  fitZoom,
} from '../../lib/crop-image';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Spinner } from './spinner';

export interface CropAspectOption {
  label: string;
  value: number;
}

export interface ImageCropDialogProps {
  open: boolean;
  file: File | null;
  aspect?: number;
  aspectLabel?: string;
  aspectOptions?: CropAspectOption[];
  shape?: 'rect' | 'circle';
  title?: string;
  hint?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  zoomLabel?: string;
  resetLabel?: string;
  fitLabel?: string;
  onCancel: () => void;
  onConfirm: (croppedFile: File) => void;
}

const MAX_ZOOM = 4;
const ZOOM_STEP = 0.05;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function ImageCropDialog({
  open,
  file,
  aspect = 1,
  aspectLabel,
  aspectOptions,
  shape = 'rect',
  title = 'Crop photo',
  hint = 'Drag to reposition, scroll or use the slider to zoom.',
  cancelLabel = 'Cancel',
  confirmLabel = 'Apply crop',
  zoomLabel = 'Zoom',
  resetLabel = 'Reset',
  fitLabel = 'Fit whole photo',
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

  const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null);
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
    if (!viewport) return;
    const measure = () => {
      const width = viewport.clientWidth;
      const height = viewport.clientHeight;
      if (width > 0 && height > 0) {
        setBoxSize({ width, height });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [viewport]);

  const frame = React.useMemo(
    () =>
      naturalSize && {
        naturalWidth: naturalSize.width,
        naturalHeight: naturalSize.height,
        boxWidth: boxSize.width,
        boxHeight: boxSize.height,
      },
    [boxSize.height, boxSize.width, naturalSize],
  );
  const minZoom = frame ? Math.min(1, fitZoom(frame)) : 1;

  const computeBounds = React.useCallback(
    (nextZoom: number) => {
      if (!frame) return { maxX: 0, maxY: 0, renderedW: 0, renderedH: 0 };
      const displayScale = coverScale(frame) * nextZoom;
      const renderedW = frame.naturalWidth * displayScale;
      const renderedH = frame.naturalHeight * displayScale;
      return {
        renderedW,
        renderedH,
        maxX: Math.abs(renderedW - frame.boxWidth) / 2,
        maxY: Math.abs(renderedH - frame.boxHeight) / 2,
      };
    },
    [frame],
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
      const clampedZoom = clamp(nextZoom, minZoom, MAX_ZOOM);
      setZoom(clampedZoom);
      setOffset((current) => clampOffset(current.x, current.y, clampedZoom));
    },
    [clampOffset, minZoom],
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
    setOffset(
      clampOffset(start.originX + dx, start.originY + dy, effectiveZoom),
    );
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
    updateZoom(effectiveZoom + delta);
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleFit = () => {
    setZoom(minZoom);
    setOffset({ x: 0, y: 0 });
  };

  const effectiveZoom = clamp(zoom, minZoom, MAX_ZOOM);
  const isFitting = effectiveZoom < 1;

  const handleConfirm = async () => {
    const image = imageRef.current;
    if (!file || !image || !frame) return;
    setIsExporting(true);
    try {
      const layout = computeCropLayout({
        ...frame,
        zoom: effectiveZoom,
        offsetX: clamped.x,
        offsetY: clamped.y,
      });
      const cropped = await exportCroppedFile(file, image, layout);
      onConfirm(cropped);
    } finally {
      setIsExporting(false);
    }
  };

  const { renderedW, renderedH } = computeBounds(effectiveZoom);
  const clamped = clampOffset(offset.x, offset.y, effectiveZoom);
  const imgLeft = (boxSize.width - renderedW) / 2 + clamped.x;
  const imgTop = (boxSize.height - renderedH) / 2 + clamped.y;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="flex max-h-[92dvh] flex-col gap-4 overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {aspectOptions && aspectOptions.length > 1 ? (
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
          ) : (
            aspectLabel && (
              <div className="flex justify-center">
                <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  {aspectLabel}
                </span>
              </div>
            )
          )}

          <div className="flex justify-center">
            <div
              ref={setViewport}
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
              {imageUrl && isFitting && (
                <img
                  src={imageUrl}
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="pointer-events-none absolute inset-0 size-full scale-110 object-cover blur-xl brightness-75"
                />
              )}
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

              {shape === 'circle' ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full ring-[999px] ring-black/55 outline outline-1 -outline-offset-1 outline-white/70"
                />
              ) : (
                /* Subtle rule-of-thirds grid */
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
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={zoomLabel}
              onClick={() => updateZoom(effectiveZoom - 0.25)}
              disabled={effectiveZoom <= minZoom}
            >
              <ZoomOut className="size-4" aria-hidden />
            </Button>
            <input
              type="range"
              aria-label={zoomLabel}
              min={minZoom}
              max={MAX_ZOOM}
              step={ZOOM_STEP}
              value={effectiveZoom}
              onChange={(event) => updateZoom(Number(event.target.value))}
              className="h-1.5 flex-1 cursor-pointer accent-primary"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={zoomLabel}
              onClick={() => updateZoom(effectiveZoom + 0.25)}
              disabled={effectiveZoom >= MAX_ZOOM}
            >
              <ZoomIn className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={fitLabel}
              title={fitLabel}
              onClick={handleFit}
              disabled={minZoom >= 1 || effectiveZoom === minZoom}
            >
              <Shrink className="size-3.5" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={resetLabel}
              title={resetLabel}
              onClick={handleReset}
              disabled={effectiveZoom === 1 && offset.x === 0 && offset.y === 0}
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
