import { CARD_GRID_CLASS } from '../../constants/travel';
import CardSkeleton from './CardSkeleton';
import SkeletonReveal from './SkeletonReveal';

interface Props {
  count: number;
  square?: boolean;
  tagWidths?: readonly string[];
  className?: string;
}

function CardGridSkeleton({
  count,
  square,
  tagWidths,
  className = CARD_GRID_CLASS,
}: Props) {
  return (
    <SkeletonReveal className={className}>
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} square={square} tagWidths={tagWidths} />
      ))}
    </SkeletonReveal>
  );
}

export default CardGridSkeleton;
