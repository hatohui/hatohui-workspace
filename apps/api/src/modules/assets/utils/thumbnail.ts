import sharp from 'sharp';

export const ASSET_THUMBNAIL_MAX_DIMENSION = 512;
export const ASSET_PREVIEW_MAX_DIMENSION = 2048;
export const ASSET_WEBP_QUALITY = 90;

export interface AssetVariants {
  thumbnail: Buffer;
  preview: Buffer;
}

export async function generateVariants(
  original: Buffer,
): Promise<AssetVariants> {
  const [thumbnail, preview] = await Promise.all([
    resizeToWebp(original, ASSET_THUMBNAIL_MAX_DIMENSION),
    resizeToWebp(original, ASSET_PREVIEW_MAX_DIMENSION),
  ]);
  return { thumbnail, preview };
}

function resizeToWebp(original: Buffer, maxDimension: number): Promise<Buffer> {
  return sharp(original)
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: ASSET_WEBP_QUALITY, smartSubsample: true })
    .toBuffer();
}

export async function fetchExternalImageBytes(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
