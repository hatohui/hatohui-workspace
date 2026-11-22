import type { ReactNode } from 'react';
import { cn } from '@hatohui/ui';
import { CARD_GRID_CLASS } from '../../constants/travel';
import type { CategoryGroup } from '../../lib/groupByCategory';

interface Props<T extends { id: string }> {
  groups: CategoryGroup<T>[];
  renderItem: (item: T) => ReactNode;
}

function CategoryGroupList<T extends { id: string }>({
  groups,
  renderItem,
}: Props<T>) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key} className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
            <h2
              className={cn(
                'text-sm font-semibold tracking-tight',
                group.isUncategorized && 'text-muted-foreground',
              )}
            >
              {group.label}
            </h2>
            <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
              {group.items.length}
            </span>
          </div>
          <div className={CARD_GRID_CLASS}>
            {group.items.map((item) => (
              <div key={`${group.key}:${item.id}`} className="contents">
                {renderItem(item)}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default CategoryGroupList;
