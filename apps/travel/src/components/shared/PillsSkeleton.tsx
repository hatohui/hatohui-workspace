import { Skeleton } from '@hatohui/ui';

function PillsSkeleton({ widths }: { widths: readonly string[] }) {
  return (
    <div aria-hidden className="flex flex-wrap gap-1">
      {widths.map((width, index) => (
        <Skeleton
          key={index}
          className="h-[18.5px] rounded-full"
          style={{ width }}
        />
      ))}
    </div>
  );
}

export default PillsSkeleton;
