import { useTranslation } from '@hatohui/i18n';
import type { UpcomingFriendDto } from '@hatohui/models';
import { formatMonth } from '@hatohui/tools';
import BirthdayCard from './BirthdayCard';

type Props = {
  friends: UpcomingFriendDto[];
};

type MonthGroup = {
  key: string;
  label: string;
  friends: UpcomingFriendDto[];
};

function groupByMonth(
  friends: UpcomingFriendDto[],
  locale: string,
): MonthGroup[] {
  const groups: MonthGroup[] = [];

  for (const friend of friends) {
    const key = friend.nextBirthdayDate.slice(0, 7);
    const lastGroup = groups.at(-1);

    if (lastGroup?.key === key) {
      lastGroup.friends.push(friend);
    } else {
      groups.push({
        key,
        label: formatMonth(friend.nextBirthdayDate, locale),
        friends: [friend],
      });
    }
  }

  return groups;
}

function BirthdayList({ friends }: Props) {
  const { t, i18n } = useTranslation();

  if (friends.length === 0) {
    return <p className="text-muted-foreground">{t('dashboard.empty')}</p>;
  }

  const groups = groupByMonth(friends, i18n.language);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.key}>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            <h2 className="font-serif text-xl">{group.label}</h2>
          </div>
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
