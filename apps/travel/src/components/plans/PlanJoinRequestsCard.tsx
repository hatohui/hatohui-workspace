import { useTranslation } from '@hatohui/i18n';
import type { TravelJoinRequestDto } from '@hatohui/models';
import { Avatar, Button } from '@hatohui/ui';
import { Check, X } from 'lucide-react';

interface PlanJoinRequestsCardProps {
  requests: TravelJoinRequestDto[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

function PlanJoinRequestsCard({
  requests,
  onApprove,
  onReject,
}: PlanJoinRequestsCardProps) {
  const { t } = useTranslation();
  if (requests.length === 0) return null;

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-5">
      <h2 className="text-base font-medium">{t('plans.joinRequests')}</h2>
      <ul className="divide-y divide-border">
        {requests.map((req) => (
          <li
            key={req.id}
            className="flex items-center justify-between gap-3 py-2.5 text-sm"
          >
            <div className="flex items-center gap-2.5">
              <Avatar
                src={req.avatarUrl ?? undefined}
                alt={req.displayName}
                className="size-8"
              />
              <div>
                <div className="font-medium">{req.displayName}</div>
                {req.handle && (
                  <div className="text-xs text-muted-foreground">
                    @{req.handle}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApprove(req.id)}
              >
                <Check className="size-3.5" aria-hidden />
                {t('plans.approve')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReject(req.id)}
              >
                <X className="size-3.5" aria-hidden />
                {t('plans.reject')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default PlanJoinRequestsCard;
