import { Skeleton } from '@hatohui/ui';
import { GALLERY_SKELETON_COUNT } from '../../constants/skeleton';
import SkeletonReveal from '../shared/SkeletonReveal';

function PlanGallerySkeleton() {
  return (
    <SkeletonReveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: GALLERY_SKELETON_COUNT }, (_, index) => (
        <Skeleton key={index} className="aspect-square rounded-xl" />
      ))}
    </SkeletonReveal>
  );
}

export default PlanGallerySkeleton;
