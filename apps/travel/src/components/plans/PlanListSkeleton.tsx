import { cn } from '@hatohui/ui';
import { PLAN_SKELETON_COUNT } from '../../constants/skeleton';
import SkeletonReveal from '../shared/SkeletonReveal';
import PlanCardSkeleton from './PlanCardSkeleton';

function PlanListSkeleton({ className }: { className?: string }) {
  return (
    <SkeletonReveal className={cn('grid gap-4 sm:grid-cols-2', className)}>
      {Array.from({ length: PLAN_SKELETON_COUNT }, (_, index) => (
        <PlanCardSkeleton key={index} />
      ))}
    </SkeletonReveal>
  );
}

export default PlanListSkeleton;
