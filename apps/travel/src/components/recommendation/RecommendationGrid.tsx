import type { ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import { ErrorState } from '@hatohui/ui';
import { UtensilsCrossed } from 'lucide-react';
import { useOpenRecommendation } from '../../hooks/useOpenRecommendation';
import CardGridSkeleton from '../shared/CardGridSkeleton';
import EmptyState from '../shared/EmptyState';
import FoodCard from './FoodCard';
import RecommendationSheet from './RecommendationSheet';

interface Props {
  recommendations: TravelRecommendationDto[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  emptyMessage: string;
  emptyAction?: ReactNode;
}

function RecommendationGrid(props: Props) {
  const { t } = useTranslation();
  const detail = useOpenRecommendation(props.recommendations);

  if (props.isLoading) return <CardGridSkeleton />;
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
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
        {props.recommendations.map((rec) => (
          <FoodCard
            key={rec.id}
            recommendation={rec}
            onOpen={() => detail.show(rec.id)}
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
