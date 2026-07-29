import { Link } from 'react-router';
import { Avatar, cn, type DayProps } from '@hatohui/ui';
import { useTranslation } from '@hatohui/i18n';
import type { UpcomingFriendDto } from '@hatohui/models';
import routes from '../constants/routes';
import { CALENDAR_MAX_VISIBLE_PER_DAY } from '../constants/directoryView';

type Props = DayProps & {
  birthdaysByDay: Map<string, UpcomingFriendDto[]>;
};

function CalendarDayCell({
  day,
  modifiers,
  birthdaysByDay,
  className,
  ...divProps
}: Props) {
  const { t } = useTranslation();
  const key = `${day.date.getMonth() + 1}-${day.date.getDate()}`;
  const friends = birthdaysByDay.get(key) ?? [];
  const visible = friends.slice(0, CALENDAR_MAX_VISIBLE_PER_DAY);
  const overflow = friends.length - visible.length;

  return (
    <div
      {...divProps}
      className={cn(
        className,
        'flex h-24 flex-col gap-0.5 overflow-hidden border-r border-b border-border p-1 last:border-r-0',
        modifiers.outside && 'bg-muted/40',
      )}
    >
      <span
        className={cn(
          'text-xs',
          modifiers.today
            ? 'font-medium text-primary'
            : modifiers.outside
              ? 'text-muted-foreground/50'
              : 'text-muted-foreground',
        )}
      >
        {day.date.getDate()}
      </span>
      {visible.map((friend) => (
        <Link
          key={friend.id}
          to={routes.friend(friend.id)}
          className="flex items-center gap-1 truncate rounded bg-card px-1 py-0.5 text-xs no-underline hover:bg-card-hover"
        >
          <Avatar
            src={friend.avatarUrl}
            alt={friend.name}
            className="h-3.5 w-3.5 shrink-0"
          />
          <span className="truncate">{friend.name}</span>
        </Link>
      ))}
      {overflow > 0 && (
        <span className="text-xs text-muted-foreground">
          {t('dashboard.calendar.more', { count: overflow })}
        </span>
      )}
    </div>
  );
}

export default CalendarDayCell;
