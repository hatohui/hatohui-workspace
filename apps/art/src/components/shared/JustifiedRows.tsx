'use client';

import type { ReactNode } from 'react';
import { cn } from '@hatohui/ui';
import { useJustifiedRows } from '@/hooks/useJustifiedRows';
import type { TileSize } from '@/lib/justifiedRows';

const LAST_ROW_CLASS = "after:grow-[999999] after:content-['']";

export function JustifiedRows<T extends TileSize>({
  items,
  renderItem,
  className,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  className: string;
}) {
  const { ref, rows } = useJustifiedRows(items);

  return (
    <div ref={ref} className={cn('flex flex-col', className)}>
      {rows ? (
        rows.map((row, index) => {
          const isLast = index === rows.length - 1;
          return (
            <div
              key={row.join('-')}
              className={cn(
                'flex gap-[inherit]',
                isLast ? LAST_ROW_CLASS : '[&>*]:max-w-none!',
              )}
            >
              {row.map((itemIndex) => renderItem(items[itemIndex]))}
            </div>
          );
        })
      ) : (
        <div className={cn('flex flex-wrap gap-[inherit]', LAST_ROW_CLASS)}>
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}
