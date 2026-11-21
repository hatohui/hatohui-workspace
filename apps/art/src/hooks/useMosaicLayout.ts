'use client';

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  GALLERY_MOSAIC_COLUMNS_NARROW,
  GALLERY_MOSAIC_COLUMNS_WIDE,
  GALLERY_MOSAIC_GAP_NARROW_PX,
  GALLERY_MOSAIC_GAP_WIDE_PX,
  GALLERY_MOSAIC_LEVEL_TOLERANCE,
  GALLERY_MOSAIC_WIDE_QUERY,
} from '@/constants/gallery';
import { galleryTileAspect, type TileSize } from '@/lib/justifiedRows';
import { packMasonry } from '@/lib/mosaicLayout';
import { mosaicColumnSpan } from '@/lib/mosaicSpan';

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(GALLERY_MOSAIC_WIDE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const isWide = () => window.matchMedia(GALLERY_MOSAIC_WIDE_QUERY).matches;
const isWideOnServer = () => true;

export function useMosaicLayout<T extends TileSize>(
  items: T[],
  getKey: (item: T) => string,
) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const wide = useSyncExternalStore(subscribe, isWide, isWideOnServer);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setWidth(element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => {
    const tiles = items.map((item) => {
      const aspect = galleryTileAspect(item);
      return { aspect, columns: mosaicColumnSpan(getKey(item), aspect) };
    });
    const { placements, height } = packMasonry(
      tiles,
      width,
      wide ? GALLERY_MOSAIC_COLUMNS_WIDE : GALLERY_MOSAIC_COLUMNS_NARROW,
      wide ? GALLERY_MOSAIC_GAP_WIDE_PX : GALLERY_MOSAIC_GAP_NARROW_PX,
      GALLERY_MOSAIC_LEVEL_TOLERANCE,
    );
    return {
      height,
      placements: placements.map((placement) => ({
        ...placement,
        item: items[placement.index],
      })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getKey is an inline accessor
  }, [items, width, wide]);

  return { ref, isReady: width > 0, ...layout };
}
