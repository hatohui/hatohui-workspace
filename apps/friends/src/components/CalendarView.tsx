import { useState } from 'react';
import { Calendar } from '@hatohui/ui';
import type { UpcomingFriendDto } from '@hatohui/models';
import { useBirthdaysByMonthDay } from '../hooks/useBirthdaysByMonthDay';
import CalendarDayCell from './CalendarDayCell';

type Props = {
  friends: UpcomingFriendDto[];
};

function CalendarView({ friends }: Props) {
  const [month, setMonth] = useState(new Date());
  const birthdaysByDay = useBirthdaysByMonthDay(friends);

  return (
    <Calendar
      month={month}
      onMonthChange={setMonth}
      captionLayout="label"
      classNames={{
        months: 'w-full',
        month: 'w-full',
        month_grid: 'w-full border-t border-l border-border',
        weekdays: 'flex w-full',
        weekday:
          'flex-1 border-r border-border py-1 text-center text-xs font-normal text-muted-foreground last:border-r-0',
        week: 'flex w-full',
        day: 'flex-1 min-w-0 p-0 align-top',
      }}
      components={{
        Day: (dayProps) => (
          <CalendarDayCell {...dayProps} birthdaysByDay={birthdaysByDay} />
        ),
      }}
    />
  );
}

export default CalendarView;
