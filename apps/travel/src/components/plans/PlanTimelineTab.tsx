import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import type { TravelParticipantMemberDto } from '@hatohui/models';
import { Button, Input } from '@hatohui/ui';
import {
  ArrowUpDown,
  Clock,
  ExternalLink,
  MapPin,
  Plane,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import routes from '../../constants/routes';
import type { useTravelTimeline } from '../../hooks/useTravelTimeline';
import PlanActivityForm from './PlanActivityForm';
import SkeletonReveal from '../shared/SkeletonReveal';
import PlanTimelineSkeleton from './PlanTimelineSkeleton';

interface PlanTimelineTabProps {
  timeline: ReturnType<typeof useTravelTimeline>;
  participants: TravelParticipantMemberDto[];
  isMember: boolean;
  isOwner: boolean;
  hasEvent: boolean;
  viewerId?: string;
}

function PlanTimelineTab({
  timeline,
  participants,
  isMember,
  isOwner,
  hasEvent,
  viewerId,
}: PlanTimelineTabProps) {
  const { t, i18n } = useTranslation();
  const fmt = new Intl.DateTimeFormat(i18n.language, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const memberNameById = new Map(
    participants.map((p) => [p.userId, p.displayName]),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={timeline.search}
            placeholder={t('plans.timeline.searchPlaceholder')}
            className="pl-9"
            onChange={(e) => timeline.setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={timeline.selectedUserId}
            onChange={(e) => timeline.setSelectedUserId(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs"
          >
            <option value="">{t('plans.gallery.allMembers')}</option>
            {participants.map((p) => (
              <option key={p.userId} value={p.userId}>
                {p.displayName}
              </option>
            ))}
          </select>

          {hasEvent && (
            <Button
              variant={timeline.showEventBoundaries ? 'secondary' : 'outline'}
              size="sm"
              onClick={() =>
                timeline.setShowEventBoundaries(!timeline.showEventBoundaries)
              }
            >
              {t('plans.timeline.showEventMarkers')}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              timeline.setSortOrder(
                timeline.sortOrder === 'asc' ? 'desc' : 'asc',
              )
            }
          >
            <ArrowUpDown className="size-3.5" aria-hidden />
            {timeline.sortOrder === 'asc'
              ? t('plans.timeline.sortAsc')
              : t('plans.timeline.sortDesc')}
          </Button>

          {isMember && (
            <Button
              size="sm"
              onClick={() => timeline.setShowAddForm(!timeline.showAddForm)}
            >
              <Plus className="size-4" aria-hidden />
              {t('plans.timeline.addActivity')}
            </Button>
          )}
        </div>
      </div>

      {timeline.showAddForm && (
        <PlanActivityForm
          participants={participants}
          places={timeline.places}
          isCreating={timeline.isCreating}
          onSubmit={timeline.addActivity}
        />
      )}

      {timeline.isLoading ? (
        <SkeletonReveal>
          <PlanTimelineSkeleton />
        </SkeletonReveal>
      ) : timeline.visibleItems.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {t('plans.timeline.empty')}
        </p>
      ) : (
        <ol className="space-y-3">
          {timeline.visibleItems.map((item) => {
            const canDelete =
              item.kind === 'activity' &&
              (isOwner || item.activity?.createdById === viewerId);
            const names = item.involvedPeople
              .map((uid) => memberNameById.get(uid))
              .filter(Boolean)
              .join(', ');

            return (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{item.title}</span>
                    {item.flights.map((flight) => (
                      <span
                        key={flight}
                        className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
                      >
                        <Plane className="size-3" aria-hidden />
                        {flight}
                      </span>
                    ))}
                    {item.placeId && (
                      <Link
                        to={routes.place(item.placeId)}
                        className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs hover:text-primary"
                      >
                        <UtensilsCrossed className="size-3" aria-hidden />
                        {item.placeName}
                      </Link>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" aria-hidden />
                      {item.from === item.to
                        ? fmt.format(new Date(item.from))
                        : `${fmt.format(new Date(item.from))} – ${fmt.format(new Date(item.to))}`}
                    </span>
                    {item.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" aria-hidden />
                        {item.location}
                      </span>
                    )}
                    {item.mapsUrl && (
                      <a
                        href={item.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-primary hover:underline"
                      >
                        {t('recommendation.openMaps')}
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    )}
                  </div>

                  {names && item.kind === 'activity' && (
                    <p className="text-xs text-muted-foreground">
                      {item.isExcludeMode
                        ? t('plans.timeline.excluding', { names })
                        : names}
                    </p>
                  )}

                  {item.note && (
                    <p className="text-xs text-foreground/85">{item.note}</p>
                  )}
                </div>

                {canDelete && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t('recommendation.delete')}
                    onClick={() => void timeline.removeActivity(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default PlanTimelineTab;
