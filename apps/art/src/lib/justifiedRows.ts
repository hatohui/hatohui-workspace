import {
  GALLERY_TILE_ASPECT_FALLBACK,
  GALLERY_TILE_ASPECT_MAX,
  GALLERY_TILE_ASPECT_MIN,
} from '@/constants/gallery';

export interface TileSize {
  width?: number | null;
  height?: number | null;
}

export function galleryTileAspect(size: TileSize): number {
  const raw =
    size.width && size.height
      ? size.width / size.height
      : GALLERY_TILE_ASPECT_FALLBACK;
  return Math.min(
    GALLERY_TILE_ASPECT_MAX,
    Math.max(GALLERY_TILE_ASPECT_MIN, raw),
  );
}

const rowHeight = (
  aspectSum: number,
  count: number,
  width: number,
  gap: number,
) => (width - gap * (count - 1)) / aspectSum;

export function packJustifiedRows(
  aspects: number[],
  width: number,
  gap: number,
  targetHeight: number,
): number[][] {
  const rows: number[][] = [];
  let row: number[] = [];
  let aspectSum = 0;

  aspects.forEach((aspect, index) => {
    const withItem = rowHeight(aspectSum + aspect, row.length + 1, width, gap);
    if (withItem > targetHeight) {
      row.push(index);
      aspectSum += aspect;
      return;
    }
    const withoutItem = row.length
      ? rowHeight(aspectSum, row.length, width, gap)
      : Infinity;
    if (targetHeight - withItem <= withoutItem - targetHeight) {
      rows.push([...row, index]);
      row = [];
      aspectSum = 0;
    } else {
      rows.push(row);
      row = [index];
      aspectSum = aspect;
    }
  });

  if (row.length) rows.push(row);
  return rows;
}
