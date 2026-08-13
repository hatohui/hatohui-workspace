import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { Avatar, Button } from '@hatohui/ui';
import type { FriendDto } from '@hatohui/models';
import routes from '../constants/routes';
import type { ConnectionAction } from '../hooks/useFriendConnection';

type Props = {
  friend: FriendDto;
  connectionAction: ConnectionAction | null;
  isConnectionBusy: boolean;
  showConnectedLabel: boolean;
  onConnectionAction: () => void;
  onDelete: () => void;
};

function FriendDetailHeader({
  friend,
  connectionAction,
  isConnectionBusy,
  showConnectedLabel,
  onConnectionAction,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const birthday =
    friend.birthMonth !== null && friend.birthDay !== null
      ? `${friend.birthMonth.toString()}/${friend.birthDay.toString()}${
          friend.birthYear !== null ? `/${friend.birthYear.toString()}` : ''
        }`
      : null;

  return (
    <div className="flex flex-col">
      <div className="h-28 rounded-t-xl bg-gradient-to-br from-primary/20 to-primary/5 sm:h-40" />
      <div className="flex flex-col gap-4 px-1 sm:px-2">
        <div className="-mt-10 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar
              src={friend.avatarUrl}
              alt={friend.name}
              className="size-20 shrink-0 border-4 border-background sm:size-28"
            />
            <div className="flex-1 pb-1">
              <h1 className="text-2xl sm:text-3xl">{friend.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {birthday && (
                  <p className="text-sm text-muted-foreground">{birthday}</p>
                )}
                {showConnectedLabel && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {t('friendDetail.connectedLabel')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {friend.canEdit && (
            <div className="flex shrink-0 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={routes.editFriend(friend.id)}>
                  {t('friendDetail.editAction')}
                </Link>
              </Button>
              {!friend.isViewerEntry && (
                <Button variant="destructive" size="sm" onClick={onDelete}>
                  {t('friendDetail.deleteAction')}
                </Button>
              )}
            </div>
          )}
        </div>

        {connectionAction && (
          <Button
            variant={connectionAction === 'disconnect' ? 'ghost' : 'outline'}
            disabled={isConnectionBusy}
            onClick={onConnectionAction}
          >
            {t(`friendDetail.connection.${connectionAction}`)}
          </Button>
        )}
      </div>
    </div>
  );
}

export default FriendDetailHeader;
