import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import type { FriendDto } from '@hatohui/models';
import { getErrorCategory, useAuth } from '@hatohui/libs';
import { useConnectFriend } from '../hooks/useConnectFriend';
import { useDeleteFriend } from '../hooks/useDeleteFriend';
import FriendDetailHeader from './FriendDetailHeader';
import FriendDetailInfo from './FriendDetailInfo';

type Props = {
  friend: FriendDto;
};

function FriendDetail({ friend }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const deleteFriend = useDeleteFriend();
  const connectFriend = useConnectFriend();
  const canConnect =
    user !== null && !friend.isViewerEntry && !friend.isConnected;
  const showConnectedLabel =
    user !== null && !friend.isViewerEntry && friend.isConnected;
  const socialMedias =
    (friend.socialMedias as Record<string, string> | null) ?? {};

  const handleDelete = () => {
    if (window.confirm(t('friendDetail.deleteConfirm'))) {
      deleteFriend.mutate({ id: friend.id });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4 shrink-0" />
        {t('friendDetail.back')}
      </button>
      <FriendDetailHeader
        friend={friend}
        canConnect={canConnect}
        isConnecting={connectFriend.isPending}
        showConnectedLabel={showConnectedLabel}
        onConnect={() => connectFriend.mutate({ id: friend.id })}
        onDelete={handleDelete}
      />
      {deleteFriend.error != null && (
        <p role="alert" className="text-sm text-destructive">
          {t(`common:errors.${getErrorCategory(deleteFriend.error)}`)}
        </p>
      )}
      {connectFriend.error != null && (
        <p role="alert" className="text-sm text-destructive">
          {t(`common:errors.${getErrorCategory(connectFriend.error)}`)}
        </p>
      )}
      <FriendDetailInfo socialMedias={socialMedias} />
    </div>
  );
}

export default FriendDetail;
