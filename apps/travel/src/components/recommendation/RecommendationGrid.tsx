import type { ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import { ErrorState } from '@hatohui/ui';
import { UtensilsCrossed } from 'lucide-react';
import { DETAIL_GRID_SKELETON_COUNT } from '../../constants/skeleton';
import { CARD_GRID_CLASS } from '../../constants/travel';
import { useFoodCardEntries } from '../../hooks/useFoodCardEntries';
import { useOpenRecommendation } from '../../hooks/useOpenRecommendation';
import CardGridSkeleton from '../shared/CardGridSkeleton';
import EmptyState from '../shared/EmptyState';
import FoodCard from './FoodCard';
import RecommendationSheet from './RecommendationSheet';

interface Props {
  recommendations: TravelRecommendationDto[];
  labelMode?: 'dish' | 'place';
  focusDishId?: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  emptyMessage: string;
  emptyAction?: ReactNode;
}

function RecommendationGrid(props: Props) {
  const { t } = useTranslation();
  const detail = useOpenRecommendation(props.recommendations);
  const entries = useFoodCardEntries(
    props.recommendations,
    props.labelMode !== 'place',
    props.focusDishId,
  );

  if (props.isLoading)
    return <CardGridSkeleton count={DETAIL_GRID_SKELETON_COUNT} square />;
  if (props.isError) {
    return (
      <ErrorState
        message={t('common:loadError')}
        retry={{ label: t('common:retry'), onClick: props.onRetry }}
      />
    );
  }
  if (!props.recommendations.length) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        message={props.emptyMessage}
        action={props.emptyAction}
      />
    );
  }
  return (
    <>
      <div className={CARD_GRID_CLASS}>
        {entries.map((entry) => (
          <FoodCard
            key={entry.key}
            recommendation={entry.recommendation}
            line={entry.line}
            labelMode={props.labelMode}
            onOpen={() => detail.show(entry.recommendation.id)}
          />
        ))}
      </div>
      <RecommendationSheet
        recommendation={detail.open}
        onClose={detail.close}
      />
    </>
  );
}

export default RecommendationGrid;
