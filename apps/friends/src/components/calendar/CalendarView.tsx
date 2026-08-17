import { useState } from 'react';
import { Calendar } from '@hatohui/ui';
import { useTranslation } from '@hatohui/i18n';
import { useBirthdaysByMonthDay } from '../../hooks/useBirthdaysByMonthDay';
import { useMonthlyBirthdays } from '../../hooks/useMonthlyBirthdays';
import CalendarDayCell from './CalendarDayCell';

type Props = {
  search: string;
};

function CalendarView({ search }: Props) {
  const { i18n } = useTranslation();
  const [month, setMonth] = useState(new Date());
  const { friends } = useMonthlyBirthdays(month.getMonth() + 1, search);
  const birthdaysByDay = useBirthdaysByMonthDay(friends);

  return (
    <Calendar
      month={month}
      onMonthChange={setMonth}
      captionLayout="label"
      className="p-1 sm:p-3"
      formatters={{
        formatWeekdayName: (date) =>
          new Intl.DateTimeFormat(i18n.language, { weekday: 'narrow' }).format(
            date,
          ),
      }}
      classNames={{
        months: 'relative w-full',
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
