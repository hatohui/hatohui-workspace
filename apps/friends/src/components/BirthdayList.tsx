import { useTranslation } from '@hatohui/i18n';
import type { FriendGroup } from '../hooks/useDirectoryFriends';
import BirthdayCard from './BirthdayCard';

type Props = {
  groups: FriendGroup[];
};

function BirthdayList({ groups }: Props) {
  const { t } = useTranslation();

  if (groups.length === 0) {
    return <p className="text-muted-foreground">{t('dashboard.empty')}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.key}>
          {group.label && (
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              <h2 className="font-serif text-xl">{group.label}</h2>
            </div>
          )}
          <ul className="ml-0.75 flex flex-col gap-3 border-l border-border py-1 pl-5">
            {group.friends.map((friend) => (
              <li key={friend.id}>
                <BirthdayCard friend={friend} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default BirthdayList;
