const CANVAS_SAFE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_OUTPUT_DIMENSION = 2048;

export interface CropArea {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export function computeCropArea(params: {
  naturalWidth: number;
  naturalHeight: number;
  boxWidth: number;
  boxHeight: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}): CropArea {
  const {
    naturalWidth,
    naturalHeight,
    boxWidth,
    boxHeight,
    zoom,
    offsetX,
    offsetY,
  } = params;
  const baseScale = Math.max(
    boxWidth / naturalWidth,
    boxHeight / naturalHeight,
  );
  const displayScale = baseScale * zoom;
  const renderedW = naturalWidth * displayScale;
  const renderedH = naturalHeight * displayScale;

  const sx = Math.max(0, ((renderedW - boxWidth) / 2 - offsetX) / displayScale);
  const sy = Math.max(
    0,
    ((renderedH - boxHeight) / 2 - offsetY) / displayScale,
  );
  const sw = Math.min(naturalWidth - sx, boxWidth / displayScale);
  const sh = Math.min(naturalHeight - sy, boxHeight / displayScale);

  return { sx, sy, sw, sh };
}

export async function exportCroppedFile(
  file: File,
  image: HTMLImageElement,
  area: CropArea,
): Promise<File> {
  const scale = Math.min(
    1,
    MAX_OUTPUT_DIMENSION / Math.max(area.sw, area.sh, 1),
  );
  const outW = Math.max(1, Math.round(area.sw * scale));
  const outH = Math.max(1, Math.round(area.sh * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not supported');
  }
  ctx.drawImage(image, area.sx, area.sy, area.sw, area.sh, 0, 0, outW, outH);

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
