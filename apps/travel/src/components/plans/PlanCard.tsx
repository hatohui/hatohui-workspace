import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import type { TravelParticipationDto } from '@hatohui/models';
import { Calendar, MapPin, Plane, Users } from 'lucide-react';
import routes from '../../constants/routes';

interface PlanCardProps {
  plan: TravelParticipationDto;
}

function PlanCard({ plan }: PlanCardProps) {
  const { t } = useTranslation();
  const title =
    plan.group?.name ?? plan.event?.title ?? t('plans.share.travelPlan');
  const memberCount = plan.group?.memberCount ?? 1;

  return (
    <Link
      to={routes.plan(plan.id)}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-medium">{title}</h3>
          {plan.event && plan.group?.name !== plan.event.title && (
            <p className="truncate text-xs text-muted-foreground">
              {plan.event.title}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          {t(`plans.leaveType.${plan.leaveType}`)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="size-3.5" aria-hidden />
          {plan.from.slice(0, 10)} – {plan.to.slice(0, 10)}
        </span>
        {plan.event?.location && (
          <span className="inline-flex items-center gap-1.5 truncate">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{plan.event.location}</span>
          </span>
        )}
        {memberCount > 1 && (
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" aria-hidden />
            {t('plans.travellers', { count: memberCount })}
          </span>
        )}
        {(plan.entryFlight || plan.exitFlight) && (
          <span className="inline-flex items-center gap-1.5">
            <Plane className="size-3.5" aria-hidden />
            {[plan.entryFlight, plan.exitFlight].filter(Boolean).join(' / ')}
          </span>
        )}
      </div>
    </Link>
  );
}

export default PlanCard;
