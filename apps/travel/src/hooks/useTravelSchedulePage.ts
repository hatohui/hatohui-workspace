import { useMemo, useState } from 'react';
import {
  useTravelCustomHolidays,
  useTravelHeatmap,
  useTravelHolidays,
  useTravelLeaveBalance,
  useTravelScheduleExceptions,
  useTravelWorkSchedule,
} from '@hatohui/models';
import { WEEKDAY_KEYS } from '../constants/schedule';

export interface CalendarCell {
  dateKey: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isWorkDay: boolean;
  exceptionKind: 'work' | 'off' | null;
  holidayName: string | null;
  leaveIntensity: number;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toDateKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

export function useTravelSchedulePage(enabled: boolean) {
  const now = new Date();
  const [month, setMonth] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const monthFrom = `${year}-${pad(monthIndex + 1)}-01`;
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
  const monthTo = `${year}-${pad(monthIndex + 1)}-${pad(lastDayOfMonth)}`;

  const yearFrom = `${year}-01-01T00:00:00.000Z`;
  const yearTo = `${year}-12-31T23:59:59.999Z`;

  const scheduleQuery = useTravelWorkSchedule({ query: { enabled } });
  const holidaysQuery = useTravelHolidays(
    { from: monthFrom, to: monthTo },
    { query: { enabled } },
  );
  const customHolidaysQuery = useTravelCustomHolidays({ query: { enabled } });
  const exceptionsQuery = useTravelScheduleExceptions({ query: { enabled } });
  const balanceQuery = useTravelLeaveBalance({
    query: { enabled, retry: false },
  });
  const heatmapQuery = useTravelHeatmap(
    { from: yearFrom, to: yearTo },
    { query: { enabled } },
  );

  const cells = useMemo<CalendarCell[]>(() => {
    const schedule = scheduleQuery.data?.data;
    const workDays = schedule
      ? WEEKDAY_KEYS.map((key) => schedule[key])
      : [false, true, true, true, true, true, false];

    const holidayMap = new Map<string, string>();
    for (const h of holidaysQuery.data?.data ?? []) {
      holidayMap.set(h.date, h.name);
    }
    for (const ch of customHolidaysQuery.data?.data ?? []) {
      holidayMap.set(ch.date, ch.name);
    }

    const exceptionMap = new Map<string, boolean>();
    for (const ex of exceptionsQuery.data?.data ?? []) {
      exceptionMap.set(ex.date, ex.isWorkDay);
    }

    const intensityMap = new Map<string, number>();
    for (const entry of heatmapQuery.data?.data ?? []) {
      intensityMap.set(entry.date, entry.intensity);
    }

    const todayKey = toDateKey(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const result: CalendarCell[] = [];

    for (let i = 0; i < firstWeekday; i++) {
      const d = new Date(year, monthIndex, 1 - (firstWeekday - i));
      const dateKey = toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
      result.push({
        dateKey,
        dayNumber: d.getDate(),
        inCurrentMonth: false,
        isToday: dateKey === todayKey,
        isWorkDay: workDays[d.getDay()],
        exceptionKind: null,
        holidayName: holidayMap.get(dateKey) ?? null,
        leaveIntensity: intensityMap.get(dateKey) ?? 0,
      });
    }

    for (let day = 1; day <= lastDayOfMonth; day++) {
      const d = new Date(year, monthIndex, day);
      const dateKey = toDateKey(year, monthIndex, day);
      const ex = exceptionMap.get(dateKey);
      const holidayName = holidayMap.get(dateKey) ?? null;
      const isWorkDay =
        ex !== undefined ? ex : !holidayName && workDays[d.getDay()];

      result.push({
        dateKey,
        dayNumber: day,
        inCurrentMonth: true,
        isToday: dateKey === todayKey,
        isWorkDay,
        exceptionKind: ex === undefined ? null : ex ? 'work' : 'off',
        holidayName,
        leaveIntensity: intensityMap.get(dateKey) ?? 0,
      });
    }

    return result;
  }, [
    scheduleQuery.data,
    holidaysQuery.data,
    customHolidaysQuery.data,
    exceptionsQuery.data,
    heatmapQuery.data,
    year,
    monthIndex,
    lastDayOfMonth,
    now,
  ]);

  return {
    month,
    year,
    cells,
    balance: balanceQuery.data?.data ?? null,
    isLoadingBalance: balanceQuery.isLoading,
    heatmap: heatmapQuery.data?.data ?? [],
    isLoadingCalendar: scheduleQuery.isLoading || holidaysQuery.isLoading,
    prevMonth: () =>
      setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1)),
    nextMonth: () =>
      setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1)),
    goToday: () => setMonth(new Date(now.getFullYear(), now.getMonth(), 1)),
  };
}
