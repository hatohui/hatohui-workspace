import type { ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import { ErrorState } from '@hatohui/ui';
import { UtensilsCrossed } from 'lucide-react';
import CardGridSkeleton from '../shared/CardGridSkeleton';
import EmptyState from '../shared/EmptyState';
import RecommendationCard from './RecommendationCard';

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
    <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {props.recommendations.map((rec) => (
        <RecommendationCard key={rec.id} recommendation={rec} />
      ))}
    </div>
  );
}

export default RecommendationGrid;
