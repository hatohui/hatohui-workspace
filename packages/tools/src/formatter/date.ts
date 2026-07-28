import { format } from 'date-fns';

export function formatDate(date: Date, formatStr: string) {
  return format(date, formatStr);
}

export function formatBirthday(isoDate: string, locale: string): string {
  const [, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(Date.UTC(2000, month - 1, day));
}

export function formatMonth(isoDate: string, locale: string): string {
  const [, month] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    timeZone: 'UTC',
  }).format(Date.UTC(2000, month - 1, 1));
}
