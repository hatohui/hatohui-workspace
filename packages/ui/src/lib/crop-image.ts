const CANVAS_SAFE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_OUTPUT_DIMENSION = 2048;
const BACKDROP_BLUR_RATIO = 0.04;

export interface CropView {
  naturalWidth: number;
  naturalHeight: number;
  boxWidth: number;
  boxHeight: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface CropLayout {
  outWidth: number;
  outHeight: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
  coversFrame: boolean;
}

export function coverScale(
  view: Omit<CropView, 'zoom' | 'offsetX' | 'offsetY'>,
) {
  return Math.max(
    view.boxWidth / view.naturalWidth,
    view.boxHeight / view.naturalHeight,
  );
}

export function fitZoom(view: Omit<CropView, 'zoom' | 'offsetX' | 'offsetY'>) {
  const contain = Math.min(
    view.boxWidth / view.naturalWidth,
    view.boxHeight / view.naturalHeight,
  );
  return contain / coverScale(view);
}

export function computeCropLayout(view: CropView): CropLayout {
  const displayScale = coverScale(view) * view.zoom;
  const renderedW = view.naturalWidth * displayScale;
  const renderedH = view.naturalHeight * displayScale;
  const left = (view.boxWidth - renderedW) / 2 + view.offsetX;
  const top = (view.boxHeight - renderedH) / 2 + view.offsetY;

  const toOutput = Math.min(
    1 / displayScale,
    MAX_OUTPUT_DIMENSION / Math.max(view.boxWidth, view.boxHeight),
  );
  const tolerance = 0.5;

  return {
    outWidth: Math.max(1, Math.round(view.boxWidth * toOutput)),
    outHeight: Math.max(1, Math.round(view.boxHeight * toOutput)),
    dx: left * toOutput,
    dy: top * toOutput,
    dw: renderedW * toOutput,
    dh: renderedH * toOutput,
    coversFrame:
      left <= tolerance &&
      top <= tolerance &&
      left + renderedW >= view.boxWidth - tolerance &&
      top + renderedH >= view.boxHeight - tolerance,
  };
}

function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const scale = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight,
  );
  const w = image.naturalWidth * scale;
  const h = image.naturalHeight * scale;
  const blur = Math.round(Math.max(width, height) * BACKDROP_BLUR_RATIO);
  ctx.save();
  ctx.filter = 'brightness(0.8)';
  ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
  ctx.filter = `blur(${blur}px) brightness(0.8)`;
  ctx.drawImage(
    image,
    (width - w) / 2 - blur,
    (height - h) / 2 - blur,
    w + blur * 2,
    h + blur * 2,
  );
  ctx.restore();
}

export async function exportCroppedFile(
  file: File,
  image: HTMLImageElement,
  layout: CropLayout,
): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = layout.outWidth;
  canvas.height = layout.outHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not supported');
  }
  if (!layout.coversFrame) {
    drawBackdrop(ctx, image, layout.outWidth, layout.outHeight);
  }
  ctx.drawImage(image, layout.dx, layout.dy, layout.dw, layout.dh);

  const outputType = CANVAS_SAFE_TYPES.has(file.type)
    ? file.type
    : 'image/webp';
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error('Failed to encode crop')),
      outputType,
      outputType === 'image/png' ? undefined : 0.92,
    );
  });

  const ext = outputType.split('/')[1] ?? 'webp';
  const base = file.name.replace(/\.[^./]+$/, '');
  return new File([blob], `${base}.${ext}`, { type: outputType });
}
