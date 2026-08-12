const AVATAR_TARGET_SIZE = 512;
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const CANVAS_SAFE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/// Center-crops the image to a square and downsamples it to `targetSize`,
/// so avatar uploads stay small and uniform regardless of what the user
/// picked. Formats the canvas can't re-encode (gif, avif) fall back to webp.
export async function resizeImageToSquare(
  file: File,
  targetSize: number = AVATAR_TARGET_SIZE,
): Promise<File> {
  const { source, revoke } = await loadImageSource(file);
  try {
    const width = 'naturalWidth' in source ? source.naturalWidth : source.width;
    const height =
      'naturalHeight' in source ? source.naturalHeight : source.height;
    const side = Math.min(width, height);
    const sx = (width - side) / 2;
    const sy = (height - side) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context is not supported');
    }
    ctx.drawImage(source, sx, sy, side, side, 0, 0, targetSize, targetSize);

    const outputType = CANVAS_SAFE_TYPES.has(file.type)
      ? file.type
      : 'image/webp';
    const blob = await encodeWithSizeCap(canvas, outputType);
    return new File([blob], renameExtension(file.name, outputType), {
      type: outputType,
    });
  } finally {
    revoke();
  }
}

async function loadImageSource(
  file: File,
): Promise<{ source: ImageBitmap | HTMLImageElement; revoke: () => void }> {
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, revoke: () => bitmap.close() };
  }

  const objectUrl = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = objectUrl;
  });
  return { source: image, revoke: () => URL.revokeObjectURL(objectUrl) };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('Failed to encode image')),
      type,
      quality,
    );
  });
}

async function encodeWithSizeCap(
  canvas: HTMLCanvasElement,
  type: string,
): Promise<Blob> {
  if (type === 'image/png') {
    return canvasToBlob(canvas, type);
  }

  let quality = 0.9;
  let blob = await canvasToBlob(canvas, type, quality);
  while (blob.size > AVATAR_MAX_BYTES && quality > 0.4) {
    quality -= 0.15;
    blob = await canvasToBlob(canvas, type, quality);
  }
  return blob;
}

function renameExtension(name: string, type: string): string {
  const ext = type.split('/')[1];
  const base = name.replace(/\.[^./]+$/, '');
  return `${base}.${ext}`;
}
