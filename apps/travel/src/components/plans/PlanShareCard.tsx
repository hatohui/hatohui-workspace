import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import type { TravelSharePlanDto } from '@hatohui/models';
import { Avatar, Button } from '@hatohui/ui';
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react';
import routes from '../../constants/routes';

interface PlanShareCardProps {
  data: TravelSharePlanDto;
}

function PlanShareCard({ data }: PlanShareCardProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      <div className="relative h-48 w-full bg-muted">
        {data.eventImageUrl ? (
          <img
            src={data.eventImageUrl}
            alt={data.eventTitle ?? data.groupName}
            className="size-full object-cover"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <span className="absolute top-3 right-3 rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
          {t(`plans.leaveType.${data.leaveType}`)}
        </span>
        {data.eventTitle && (
          <div className="absolute right-0 bottom-0 left-0 p-4 text-white">
            <p className="text-base font-semibold leading-snug">
              {data.eventTitle}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{data.groupName}</h1>
            <p className="text-xs text-muted-foreground">
              {t('plans.share.travelPlan')}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Avatar
              src={data.sharerAvatarUrl ?? undefined}
              alt={data.sharerName}
              className="size-7"
            />
            <span className="text-sm font-medium">{data.sharerName}</span>
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" aria-hidden />
            <span className="font-medium text-foreground">
              {data.from.slice(0, 10)} – {data.to.slice(0, 10)}
            </span>
          </div>
          {data.eventLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" aria-hidden />
              <span className="truncate">{data.eventLocation}</span>
            </div>
          )}
          {data.memberCount > 1 && (
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" aria-hidden />
              <span>{t('plans.travellers', { count: data.memberCount })}</span>
            </div>
          )}
        </div>

        {data.eventDescription && (
          <p className="line-clamp-3 border-t border-border pt-3 text-xs text-muted-foreground">
            {data.eventDescription}
          </p>
        )}

        <Button asChild className="w-full">
          <Link to={routes.plan(data.id)}>
            {t('plans.share.viewFullPlan')}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default PlanShareCard;
