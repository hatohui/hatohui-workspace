export interface CivilDate {
  year: number;
  month: number;
  day: number;
}

export interface NextOccurrence {
  daysUntil: number;
  occursOn: CivilDate;
}

export function civilDateIn(instant: Date, timezone: string): CivilDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);

  const read = (type: 'year' | 'month' | 'day') =>
    Number(parts.find((part) => part.type === type)?.value);

  return { year: read('year'), month: read('month'), day: read('day') };
}

export function nextOccurrence(
  today: CivilDate,
  month: number,
  day: number,
): NextOccurrence {
  const thisYear = celebratedOn(today.year, month, day);

  const occursOn =
    daysBetween(today, thisYear) >= 0
      ? thisYear
      : celebratedOn(today.year + 1, month, day);

  return { daysUntil: daysBetween(today, occursOn), occursOn };
}

export function toUtcDate({ year, month, day }: CivilDate): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatCivilDate({ year, month, day }: CivilDate): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

function celebratedOn(year: number, month: number, day: number): CivilDate {
  if (month === 2 && day === 29 && !isLeapYear(year)) {
    return { year, month: 2, day: 28 };
  }
  return { year, month, day };
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysBetween(from: CivilDate, to: CivilDate): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round(
    (toUtcDate(to).getTime() - toUtcDate(from).getTime()) / MS_PER_DAY,
  );
}
