import { cn, type DayProps } from '@hatohui/ui';
import { useTranslation } from '@hatohui/i18n';
import type { FriendDto } from '@hatohui/models';
import CalendarBirthdayEntry from './CalendarBirthdayEntry';
import { CALENDAR_MAX_VISIBLE_PER_DAY } from '../../constants/directoryView';

type Props = DayProps & {
  birthdaysByDay: Map<string, FriendDto[]>;
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
        'flex h-16 flex-col gap-px overflow-hidden border-r border-b border-border p-0.5 last:border-r-0 sm:h-24 sm:gap-0.5 sm:p-1',
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
        <CalendarBirthdayEntry
          key={friend.id}
          friend={friend}
          year={day.date.getFullYear()}
        />
      ))}
      {overflow > 0 && (
        <span className="text-[10px] text-muted-foreground sm:text-xs">
          {t('dashboard.calendar.more', { count: overflow })}
        </span>
      )}
    </div>
  );
}

export default CalendarDayCell;
