import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { Avatar, cn } from '@hatohui/ui';
import type { UpcomingFriendDto } from '@hatohui/models';
import { formatBirthday } from '@hatohui/tools';
import routes from '../constants/routes';

type Props = {
  friend: UpcomingFriendDto;
};

function BirthdayCard({ friend }: Props) {
  const { t, i18n } = useTranslation();
  const date = formatBirthday(friend.nextBirthdayDate, i18n.language);

  return (
    <Link
      to={routes.friend(friend.handle ?? friend.id)}
      className={cn(
        'flex flex-col gap-6 rounded-xl border bg-card px-6 py-6 text-card-foreground no-underline transition-[background-color,box-shadow] duration-200 ease-out hover:bg-card-hover hover:shadow-[0_1px_3px_rgba(20,20,19,0.08)]',
        friend.isViewerEntry && 'border-primary ring-primary/15 ring-2',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-3 font-medium">
          <Avatar
            src={friend.avatarUrl}
            alt={friend.name}
            className="h-10 w-10"
          />
          <span className="flex flex-col">
            {friend.name}
            {friend.handle && (
              <span className="text-sm font-normal text-muted-foreground">
                @{friend.handle}
              </span>
            )}
          </span>
        </span>
        <time
          className="text-sm text-muted-foreground"
          dateTime={friend.nextBirthdayDate}
        >
          {friend.turningAge !== null
            ? t('dashboard.turningAge', { age: friend.turningAge, date })
            : date}
        </time>
      </div>
    </Link>
  );
}

export default BirthdayCard;
