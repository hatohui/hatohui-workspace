'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  GALLERY_FULL_ROW_BASIS_SLACK,
  GALLERY_LAST_ROW_STRETCH_MIN_FILL,
} from '@/constants/gallery';
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

export function useJustifiedRows(items: TileSize[], stretchLastRow: boolean) {
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

  return useMemo(() => {
    const tileStyles: (CSSProperties | undefined)[] = [];
    if (!measure || !measure.width || !measure.targetHeight) {
      return { ref, tileStyles, isLastRowOpen: true };
    }

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
    const lastRowFill = lastRowWidth / measure.width;
    const isLastRowOpen =
      lastRowFill < 1 &&
      (!stretchLastRow || lastRowFill < GALLERY_LAST_ROW_STRETCH_MIN_FILL);

    rows.forEach((row, rowIndex) => {
      if (isLastRowOpen && rowIndex === rows.length - 1) {
        row.forEach((index) => {
          tileStyles[index] = {
            flex: `0 0 calc(var(--gallery-row) * ${aspects[index]})`,
          };
        });
        return;
      }
      const aspectSum = row.reduce((sum, index) => sum + aspects[index], 0);
      const gaps = measure.gap * (row.length - 1);
      row.forEach((index) => {
        const share =
          (aspects[index] / aspectSum) * GALLERY_FULL_ROW_BASIS_SLACK;
        tileStyles[index] = {
          flex: `${aspects[index]} 1 calc((100% - ${gaps}px) * ${share})`,
        };
      });
    });

    return { ref, tileStyles, isLastRowOpen };
  }, [items, measure, stretchLastRow]);
}
