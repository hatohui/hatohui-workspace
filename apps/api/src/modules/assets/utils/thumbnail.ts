import sharp from 'sharp';

export const ASSET_THUMBNAIL_MAX_WIDTH = 800;
export const ASSET_THUMBNAIL_WEBP_QUALITY = 75;

export async function generateThumbnail(original: Buffer): Promise<Buffer> {
  return sharp(original)
    .resize({ width: ASSET_THUMBNAIL_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: ASSET_THUMBNAIL_WEBP_QUALITY })
    .toBuffer();
}

export async function fetchExternalImageBytes(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
