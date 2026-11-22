import { cn, Skeleton } from '@hatohui/ui';
import { ADMIN_SKELETON_CELL_WIDTHS } from '../../constants/skeleton';

interface Props {
  columns: number;
  offset: number;
  header?: boolean;
}

function AdminSkeletonRow({ columns, offset, header = false }: Props) {
  const widths = ADMIN_SKELETON_CELL_WIDTHS;
  return (
    <div
      className={cn(
        'flex border-b border-border last:border-b-0',
        header && 'bg-muted',
      )}
    >
      {Array.from({ length: columns }, (_, index) => (
        <div
          key={index}
          className="flex h-9 min-w-0 flex-1 items-center border-r border-border px-3 last:border-r-0"
        >
          <Skeleton
            className={cn(
              'h-3.5',
              header
                ? 'w-1/2 bg-foreground/10'
                : widths[(offset + index) % widths.length],
            )}
          />
        </div>
      ))}
      <div className="w-10 shrink-0 border-l border-border" />
    </div>
  );
}

export default AdminSkeletonRow;
