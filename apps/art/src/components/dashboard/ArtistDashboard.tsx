'use client';

import { useTranslation } from '@hatohui/i18n';
import { useArtistDashboardView } from '@/hooks/useArtistDashboardView';
import { DASHBOARD_ROUTES } from '@/constants/dashboard';
import { CommissionRequestPanel } from '@/components/requests/CommissionRequestPanel';
import { DashboardHeader } from './DashboardHeader';
import { DashboardStats } from './DashboardStats';
import { DashboardAttention } from './DashboardAttention';
import { DashboardOpeningCard } from './DashboardOpeningCard';
import { DashboardPanel } from './DashboardPanel';
import { DashboardRequestItem } from './DashboardRequestItem';
import { DashboardDeadlineItem } from './DashboardDeadlineItem';
import { DashboardSkeleton } from './DashboardSkeleton';

export function ArtistDashboard() {
  const { t } = useTranslation('art');
  const view = useArtistDashboardView();

  return (
    <div className="space-y-8">
      <DashboardHeader greeting={view.greeting} today={view.today} />

      {view.isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashboardAttention
            message={view.attention}
            hasWaiting={view.hasWaiting}
          />
          <DashboardStats stats={view.stats} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <DashboardPanel
              className="lg:col-span-2"
              title={t('app.dashboard.recent.title')}
              href={DASHBOARD_ROUTES.requests}
              empty={
                view.recentRequests.length === 0
                  ? t('app.dashboard.recent.empty')
                  : null
              }
            >
              {view.recentRequests.map((item) => (
                <DashboardRequestItem
                  key={item.id}
                  item={item}
                  onOpen={() => view.select(item.id)}
                />
              ))}
            </DashboardPanel>

            <div className="space-y-6">
              <DashboardOpeningCard opening={view.opening} />
              <DashboardPanel
                title={t('app.dashboard.deadlines.title')}
                empty={
                  view.upcomingDeadlines.length === 0
                    ? t('app.dashboard.deadlines.empty')
                    : null
                }
              >
                {view.upcomingDeadlines.map((item) => (
                  <DashboardDeadlineItem
                    key={item.id}
                    item={item}
                    onOpen={() => view.select(item.id)}
                  />
                ))}
              </DashboardPanel>
            </div>
          </div>
        </>
      )}

      <CommissionRequestPanel
        id={view.selectedId}
        onClose={() => view.select(null)}
      />
    </div>
  );
}
