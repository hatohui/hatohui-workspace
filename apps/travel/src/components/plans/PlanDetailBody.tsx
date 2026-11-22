import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { Calendar, Link2, MapPin, UserPlus } from 'lucide-react';
import { useTravelGallery } from '../../hooks/useTravelGallery';
import {
  useTravelPlanDetail,
  type PlanTab,
} from '../../hooks/useTravelPlanDetail';
import { useTravelTimeline } from '../../hooks/useTravelTimeline';
import PlanGalleryTab from './PlanGalleryTab';
import PlanJoinRequestsCard from './PlanJoinRequestsCard';
import PlanMembersCard from './PlanMembersCard';
import PlanSettingsForm from './PlanSettingsForm';
import PlanTimelineTab from './PlanTimelineTab';
import PlanUpcomingWidget from './PlanUpcomingWidget';

interface PlanDetailBodyProps {
  state: ReturnType<typeof useTravelPlanDetail>;
  viewerId?: string;
}

function PlanDetailBody({ state, viewerId }: PlanDetailBodyProps) {
  const { t } = useTranslation();
  const plan = state.plan;
  const timeline = useTravelTimeline(plan, viewerId);
  const gallery = useTravelGallery(plan.id);

  const showTimeline = plan.isMember || plan.group.isActivityPublicVisible;
  const showGallery = plan.isMember || plan.group.isMediaPublicVisible;
  const showMembers = plan.isMember || plan.group.isMemberListPublicVisible;

  const tabs: PlanTab[] = [
    'overview',
    ...(showTimeline ? (['timeline'] as const) : []),
    ...(showGallery ? (['gallery'] as const) : []),
    ...(showMembers ? (['members'] as const) : []),
    ...(plan.isOwner ? (['settings'] as const) : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {plan.group.name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" aria-hidden />
              {plan.from.slice(0, 10)} – {plan.to.slice(0, 10)}
            </span>
            {plan.event?.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden />
                {plan.event.location}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {plan.group.isPublic && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void state.copyShareLink()}
            >
              <Link2 className="size-4" aria-hidden />
              {t('plans.share.copyLink')}
            </Button>
          )}
          {viewerId && !plan.isMember && plan.group.isPublic && (
            <Button
              size="sm"
              disabled={plan.myJoinRequestStatus === 'PENDING'}
              onClick={() => void state.requestJoin()}
            >
              <UserPlus className="size-4" aria-hidden />
              {plan.myJoinRequestStatus === 'PENDING'
                ? t('plans.requestPending')
                : t('plans.requestJoin')}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border pb-3">
        {tabs.map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={state.tab === tab ? 'default' : 'ghost'}
            onClick={() => state.setTab(tab)}
          >
            {t(`plans.tabs.${tab}`)}
          </Button>
        ))}
      </div>

      {state.tab === 'overview' && (
        <div className="space-y-4">
          {plan.isOwner && (
            <PlanJoinRequestsCard
              requests={state.joinRequests}
              onApprove={(reqId) => void state.approveRequest(reqId)}
              onReject={(reqId) => void state.rejectRequest(reqId)}
            />
          )}
          {showTimeline && (
            <PlanUpcomingWidget
              items={timeline.upcomingItems}
              onOpenTimeline={() => state.setTab('timeline')}
            />
          )}
          {showMembers && (
            <PlanMembersCard
              participants={plan.participants}
              ownerId={plan.group.ownerId}
              isOwner={plan.isOwner}
              isMember={plan.isMember}
              onKick={(uid) => void state.kickMember(uid)}
              onTransferOwner={(uid) => void state.transferOwner(uid)}
              onLeave={() => void state.leave()}
            />
          )}
        </div>
      )}

      {state.tab === 'timeline' && showTimeline && (
        <PlanTimelineTab
          timeline={timeline}
          participants={plan.participants}
          isMember={plan.isMember}
          isOwner={plan.isOwner}
          hasEvent={Boolean(plan.event)}
          viewerId={viewerId}
        />
      )}

      {state.tab === 'gallery' && showGallery && (
        <PlanGalleryTab
          gallery={gallery}
          activities={timeline.activities}
          participants={plan.participants}
          isMember={plan.isMember}
          isOwner={plan.isOwner}
          viewerId={viewerId}
        />
      )}

      {state.tab === 'members' && showMembers && (
        <PlanMembersCard
          participants={plan.participants}
          ownerId={plan.group.ownerId}
          isOwner={plan.isOwner}
          isMember={plan.isMember}
          onKick={(uid) => void state.kickMember(uid)}
          onTransferOwner={(uid) => void state.transferOwner(uid)}
          onLeave={() => void state.leave()}
        />
      )}

      {state.tab === 'settings' && plan.isOwner && (
        <PlanSettingsForm
          group={plan.group}
          isSaving={state.isSavingSettings}
          onSave={state.saveSettings}
          onDelete={state.deletePlan}
        />
      )}
    </div>
  );
}

export default PlanDetailBody;
