'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { GALLERY_LAST_ROW_STRETCH_MIN_FILL } from '@/constants/gallery';
import {
  galleryTileAspect,
  packJustifiedRows,
  type TileSize,
} from '@/lib/justifiedRows';

interface Measure {
  width: number;
  gap: number;
  targetHeight: number;
}

export function useJustifiedRows(items: TileSize[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [measure, setMeasure] = useState<Measure | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const style = getComputedStyle(element);
      setMeasure({
        width: element.clientWidth,
        gap: parseFloat(style.columnGap) || 0,
        targetHeight: parseFloat(style.getPropertyValue('--gallery-row')),
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => {
    if (!measure || !measure.width || !measure.targetHeight) return null;
    const aspects = items.map(galleryTileAspect);
    const rows = packJustifiedRows(
      aspects,
      measure.width,
      measure.gap,
      measure.targetHeight,
    );
    const lastRow = rows.at(-1) ?? [];
    const lastRowWidth =
      lastRow.reduce((sum, index) => sum + aspects[index], 0) *
        measure.targetHeight +
      measure.gap * Math.max(0, lastRow.length - 1);
    return {
      rows,
      isLastRowFull:
        lastRowWidth / measure.width >= GALLERY_LAST_ROW_STRETCH_MIN_FILL,
    };
  }, [items, measure]);

  return {
    ref,
    rows: layout?.rows ?? null,
    isLastRowFull: layout?.isLastRowFull ?? false,
  };
}
