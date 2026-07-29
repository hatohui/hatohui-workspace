import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { Avatar, Button } from '@hatohui/ui';
import type { FriendDto } from '@hatohui/models';
import { getErrorCategory } from '@hatohui/libs';
import { useDeleteFriend } from '../hooks/useDeleteFriend';
import routes from '../constants/routes';

type Props = {
  friend: FriendDto;
};

function FriendDetail({ friend }: Props) {
  const { t } = useTranslation();
  const deleteFriend = useDeleteFriend();

  const socialMedias =
    (friend.socialMedias as Record<string, string> | null) ?? {};

  const handleDelete = () => {
    if (window.confirm(t('friendDetail.deleteConfirm'))) {
      deleteFriend.mutate({ id: friend.id });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Avatar src={friend.avatarUrl} alt={friend.name} />
      <h1 className="text-3xl">{friend.name}</h1>
      {friend.birthMonth !== null && friend.birthDay !== null && (
        <p className="text-muted-foreground">
          {friend.birthMonth}/{friend.birthDay}
          {friend.birthYear !== null ? `/${friend.birthYear.toString()}` : ''}
        </p>
      )}
      <ul className="flex flex-col gap-1">
        {Object.entries(socialMedias).map(([platform, handle]) => (
          <li key={platform} className="text-sm">
            <span className="font-medium">{platform}:</span> {handle}
          </li>
        ))}
      </ul>
      {friend.canEdit && (
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={routes.editFriend(friend.id)}>
              {t('friendDetail.editAction')}
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            {t('friendDetail.deleteAction')}
          </Button>
        </div>
      )}
      {deleteFriend.error != null && (
        <p role="alert" className="text-sm text-destructive">
          {t(`common:errors.${getErrorCategory(deleteFriend.error)}`)}
        </p>
      )}
      <Link to={routes.dashboard} className="text-sm text-muted-foreground">
        {t('friendDetail.backToDashboard')}
      </Link>
    </div>
  );
}

export default FriendDetail;
