import { useMemo, type CSSProperties } from 'react';
import type { AssetDto } from '@hatohui/models';
import {
  GALLERY_MAX_ROW_HEIGHT_PX,
  GALLERY_TILE_ASPECT_FALLBACK,
  GALLERY_TILE_ASPECT_MAX,
  GALLERY_TILE_ASPECT_MIN,
  GALLERY_TILE_GROWTH_ALLOWANCE,
} from '@/constants/gallery';

export function useGalleryTile(asset: Pick<AssetDto, 'width' | 'height'>) {
  return useMemo(() => {
    const raw =
      asset.width && asset.height
        ? asset.width / asset.height
        : GALLERY_TILE_ASPECT_FALLBACK;
    const aspect = Math.min(
      GALLERY_TILE_ASPECT_MAX,
      Math.max(GALLERY_TILE_ASPECT_MIN, raw),
    );
    const maxTileWidth = Math.ceil(
      GALLERY_MAX_ROW_HEIGHT_PX * aspect * GALLERY_TILE_GROWTH_ALLOWANCE,
    );

    const tileStyle: CSSProperties = {
      flexGrow: aspect,
      flexBasis: `calc(var(--gallery-row) * ${aspect})`,
      maxWidth: `calc(var(--gallery-row) * ${aspect * GALLERY_TILE_GROWTH_ALLOWANCE})`,
    };
    const frameStyle: CSSProperties = { paddingBottom: `${100 / aspect}%` };
    const sizes = `(max-width: 640px) 100vw, ${maxTileWidth}px`;

    return { tileStyle, frameStyle, sizes };
  }, [asset.width, asset.height]);
}
