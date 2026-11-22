import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { Button, Skeleton } from '@hatohui/ui';
import { Plane, Plus } from 'lucide-react';
import PlanCard from '../../components/plans/PlanCard';
import EmptyState from '../../components/shared/EmptyState';
import routes from '../../constants/routes';
import { useTravelPlans } from '../../hooks/useTravelPlans';

function PlansPage() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const { plans, isLoading } = useTravelPlans(Boolean(user));

  if (!authLoading && !user) {
    return <EmptyState icon={Plane} message={t('plans.signInPrompt')} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('plans.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('plans.subtitle')}</p>
        </div>
        <Button asChild size="sm">
          <Link to={routes.planNew}>
            <Plus className="size-4" aria-hidden />
            {t('plans.create')}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : plans.length === 0 ? (
        <EmptyState icon={Plane} message={t('plans.empty')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PlansPage;
