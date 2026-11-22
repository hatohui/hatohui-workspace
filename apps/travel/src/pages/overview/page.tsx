import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { useTravelLeaveBalance } from '@hatohui/models';
import { Button } from '@hatohui/ui';
import { CalendarDays, CalendarRange, Compass, Plus } from 'lucide-react';
import BrowseFoodCard from '../../components/food/BrowseFoodCard';
import PlanCard from '../../components/plans/PlanCard';
import LeaveBalanceCards from '../../components/schedule/LeaveBalanceCards';
import EmptyState from '../../components/shared/EmptyState';
import routes from '../../constants/routes';
import { useTravelPlans } from '../../hooks/useTravelPlans';
import PlanListSkeleton from '../../components/plans/PlanListSkeleton';

function OverviewPage() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const signedIn = Boolean(user);

  const balanceQuery = useTravelLeaveBalance({
    query: { enabled: signedIn, retry: false },
  });
  const { plans, isLoading: plansLoading } = useTravelPlans(signedIn);

  if (!authLoading && !user) {
    return <EmptyState icon={Compass} message={t('overview.signInPrompt')} />;
  }

  const nowMs = Date.now();
  const upcoming = plans
    .filter((p) => new Date(p.to).getTime() >= nowMs)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('overview.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('overview.subtitle')}
        </p>
      </div>

      <BrowseFoodCard />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-medium">{t('overview.quickActions')}</h2>
          <div className="flex flex-col gap-2 pt-1">
            <Button asChild size="sm" className="justify-start">
              <Link to={routes.planNew}>
                <Plus className="size-4" aria-hidden />
                {t('overview.newPlan')}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <Link to={routes.events}>
                <CalendarRange className="size-4" aria-hidden />
                {t('overview.browseEvents')}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <Link to={routes.schedule}>
                <CalendarDays className="size-4" aria-hidden />
                {t('overview.viewSchedule')}
              </Link>
            </Button>
          </div>
        </aside>

        <div className="space-y-6">
          <LeaveBalanceCards
            balance={balanceQuery.data?.data ?? null}
            isLoading={balanceQuery.isLoading}
          />

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-medium">
                {t('overview.upcomingPlans')}
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link to={routes.plans}>{t('overview.viewAllPlans')}</Link>
              </Button>
            </div>
            {plansLoading || authLoading ? (
              <PlanListSkeleton className="gap-3" />
            ) : upcoming.length === 0 ? (
              <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                {t('overview.noUpcoming')}
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {upcoming.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;
