import { useParams } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { Skeleton } from '@hatohui/ui';
import { Lock } from 'lucide-react';
import PlanDetailBody from '../../../components/plans/PlanDetailBody';
import EmptyState from '../../../components/shared/EmptyState';
import { useTravelPlanDetail } from '../../../hooks/useTravelPlanDetail';

function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const state = useTravelPlanDetail(id ?? '');

  if (state.isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  if (state.isError || !state.plan) {
    return <EmptyState icon={Lock} message={t('plans.share.notFound')} />;
  }

  return <PlanDetailBody state={state} viewerId={user?.id} />;
}

export default PlanDetailPage;
