import { useTranslation } from '@hatohui/i18n';
import type { TravelParticipantMemberDto } from '@hatohui/models';
import { Avatar, Button } from '@hatohui/ui';
import { Crown, LogOut, Plane, UserMinus } from 'lucide-react';

interface PlanMembersCardProps {
  participants: TravelParticipantMemberDto[];
  ownerId: string;
  isOwner: boolean;
  isMember: boolean;
  onKick: (userId: string) => void;
  onTransferOwner: (userId: string) => void;
  onLeave: () => void;
}

function PlanMembersCard({
  participants,
  ownerId,
  isOwner,
  isMember,
  onKick,
  onTransferOwner,
  onLeave,
}: PlanMembersCardProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-medium">
          {t('plans.travellers', { count: participants.length })}
        </h2>
        {isMember && (
          <Button variant="outline" size="sm" onClick={onLeave}>
            <LogOut className="size-3.5" aria-hidden />
            {t('plans.leave')}
          </Button>
        )}
      </div>

      <ul className="divide-y divide-border">
        {participants.map((member) => {
          const memberIsOwner = member.userId === ownerId;
          return (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={member.avatarUrl ?? undefined}
                  alt={member.displayName}
                  className="size-9"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>{member.displayName}</span>
                    {memberIsOwner && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                        <Crown className="size-3" aria-hidden />
                        {t('plans.owner')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                    <span>
                      {member.from.slice(0, 10)} – {member.to.slice(0, 10)}
                    </span>
                    {member.isAlreadyHere && (
                      <span>{t('plans.alreadyHere')}</span>
                    )}
                    {(member.entryFlight || member.exitFlight) && (
                      <span className="inline-flex items-center gap-1">
                        <Plane className="size-3" aria-hidden />
                        {[member.entryFlight, member.exitFlight]
                          .filter(Boolean)
                          .join(' / ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isOwner && !memberIsOwner && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTransferOwner(member.userId)}
                  >
                    <Crown className="size-3.5" aria-hidden />
                    {t('plans.makeOwner')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onKick(member.userId)}
                  >
                    <UserMinus className="size-3.5" aria-hidden />
                    {t('plans.kick')}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default PlanMembersCard;
