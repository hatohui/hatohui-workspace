import sharp from 'sharp';

export const ASSET_THUMBNAIL_MAX_DIMENSION = 1600;
export const ASSET_THUMBNAIL_WEBP_QUALITY = 90;

export async function generateThumbnail(original: Buffer): Promise<Buffer> {
  return sharp(original)
    .rotate()
    .resize({
      width: ASSET_THUMBNAIL_MAX_DIMENSION,
      height: ASSET_THUMBNAIL_MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: ASSET_THUMBNAIL_WEBP_QUALITY, smartSubsample: true })
    .toBuffer();
}

export async function fetchExternalImageBytes(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
