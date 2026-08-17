import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import type { FriendDto } from '@hatohui/models';
import { getErrorCategory } from '@hatohui/libs';
import { useFriendConnection } from '../../hooks/useFriendConnection';
import { useDeleteFriend } from '../../hooks/useDeleteFriend';
import FriendDetailHeader from './FriendDetailHeader';
import FriendDetailInfo from './FriendDetailInfo';

type Props = {
  friend: FriendDto;
};

function FriendDetail({ friend }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteFriend = useDeleteFriend();
  const connection = useFriendConnection(friend);
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
        onClick={() => void navigate(-1)}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4 shrink-0" />
        {t('friendDetail.back')}
      </button>
      <FriendDetailHeader
        friend={friend}
        connectionAction={connection.action}
        isConnectionBusy={connection.isBusy}
        showConnectedLabel={connection.isConnected}
        onConnectionAction={connection.run}
        onDelete={handleDelete}
      />
      {deleteFriend.error != null && (
        <p role="alert" className="text-sm text-destructive">
          {t(`common:errors.${getErrorCategory(deleteFriend.error)}`)}
        </p>
      )}
      {connection.error != null && (
        <p role="alert" className="text-sm text-destructive">
          {t(`common:errors.${getErrorCategory(connection.error)}`)}
        </p>
      )}
      <FriendDetailInfo socialMedias={socialMedias} />
    </div>
  );
}

export default FriendDetail;
