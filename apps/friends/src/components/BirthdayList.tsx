import { useTranslation } from '@hatohui/i18n';
import type { UpcomingFriendDto } from '@hatohui/models';
import BirthdayCard from './BirthdayCard';

type Props = {
  friends: UpcomingFriendDto[];
};

function BirthdayList({ friends }: Props) {
  const { t } = useTranslation();

  if (friends.length === 0) {
    return <p className="text-muted-foreground">{t('dashboard.empty')}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {friends.map((friend) => (
        <li key={friend.id}>
          <BirthdayCard friend={friend} />
        </li>
      ))}
    </ul>
  );
}

export default BirthdayList;
