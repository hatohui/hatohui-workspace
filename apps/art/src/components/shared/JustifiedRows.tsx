'use client';

import type { ReactNode } from 'react';
import { cn } from '@hatohui/ui';
import { useJustifiedRows } from '@/hooks/useJustifiedRows';
import type { TileSize } from '@/lib/justifiedRows';

const LAST_ROW_CLASS = "after:grow-[999999] after:content-['']";
const SIZED_TILE_CLASS = '[&>*]:max-w-none!';

export function JustifiedRows<T extends TileSize>({
  items,
  getKey,
  renderItem,
  className,
  stretchLastRow = false,
}: {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  className: string;
  stretchLastRow?: boolean;
}) {
  const { ref, tileStyles, isLastRowOpen } = useJustifiedRows(
    items,
    stretchLastRow,
  );

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-wrap',
        isLastRowOpen && LAST_ROW_CLASS,
        className,
      )}
    >
      {items.map((item, index) => {
        const style = tileStyles[index];
        return (
          <div
            key={getKey(item)}
            style={style}
            className={style ? SIZED_TILE_CLASS : 'contents'}
          >
            {renderItem(item)}
          </div>
        );
      })}
    </div>
  );
}
