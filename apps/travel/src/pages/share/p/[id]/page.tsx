import { useParams } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { useTravelParticipationShare } from '@hatohui/models';
import { Skeleton } from '@hatohui/ui';
import { Lock } from 'lucide-react';
import PlanShareCard from '../../../../components/plans/PlanShareCard';
import EmptyState from '../../../../components/shared/EmptyState';

function SharePlanPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const query = useTravelParticipationShare(id ?? '', {
    query: { enabled: Boolean(id), retry: false },
  });

  if (query.isLoading) {
    return <Skeleton className="mx-auto h-96 max-w-sm rounded-2xl" />;
  }

  if (query.isError || !query.data?.data) {
    return <EmptyState icon={Lock} message={t('plans.share.notFound')} />;
  }

  return (
    <div className="py-8">
      <PlanShareCard data={query.data.data} />
    </div>
  );
}

export default SharePlanPage;
