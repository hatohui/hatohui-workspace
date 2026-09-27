const COMPRESSED_QUALITY = 0.92;
const SCALE_STEP = 0.85;
const MAX_ATTEMPTS = 8;
const PREFERRED_TYPE = 'image/webp';
const FALLBACK_TYPE = 'image/jpeg';

async function encode(
  file: File,
  width: number,
  height: number,
  type: string,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    resizeWidth: width,
    resizeHeight: height,
    resizeQuality: 'high',
  });
  const canvas = new OffscreenCanvas(width, height);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas.convertToBlob({ type, quality: COMPRESSED_QUALITY });
}

function renamed(name: string, type: string): string {
  const extension = type === PREFERRED_TYPE ? 'webp' : 'jpg';
  return `${name.replace(/\.[^.]+$/, '')}.${extension}`;
}

export async function compressImageToFit(
  file: File,
  maxBytes: number,
): Promise<File> {
  const probe = await createImageBitmap(file);
  const { width, height } = probe;
  probe.close();

  let type = PREFERRED_TYPE;
  let scale = 1;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const blob = await encode(
      file,
      Math.max(1, Math.round(width * scale)),
      Math.max(1, Math.round(height * scale)),
      type,
    );
    if (blob.type !== type) type = FALLBACK_TYPE;
    else if (blob.size <= maxBytes) {
      return new File([blob], renamed(file.name, type), { type });
    } else scale *= SCALE_STEP;
  }
  throw new Error(`Could not compress ${file.name} under ${maxBytes} bytes`);
}
