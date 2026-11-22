import { cn, Skeleton } from '@hatohui/ui';

interface Props {
  box: string;
  className: string;
}

function SkeletonLine({ box, className }: Props) {
  return (
    <div aria-hidden className={cn('flex items-center', box)}>
      <Skeleton className={className} />
    </div>
  );
}

export default SkeletonLine;
