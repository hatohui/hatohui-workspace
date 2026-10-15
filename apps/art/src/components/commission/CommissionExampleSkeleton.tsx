import { Skeleton } from '@hatohui/ui';
import { COMMISSION_GALLERY_SKELETON_COUNT } from '@/constants/commission';

export function CommissionExampleSkeleton() {
  return (
    <div aria-busy className="grid grid-cols-2 gap-2">
      {Array.from({ length: COMMISSION_GALLERY_SKELETON_COUNT }, (_, index) => (
        <Skeleton key={index} className="aspect-square rounded-lg" />
      ))}
    </div>
  );
}
