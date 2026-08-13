import { format } from 'date-fns';

export function formatDate(date: Date, formatStr: string) {
  return format(date, formatStr);
}

/// Always day-before-month, regardless of locale. Intl's own numeric
/// ordering only happens to be day-first for 'vi' among this app's locales
/// — 'zh'/'ja'/'en' render month-first — which would make the same date
/// look inconsistent depending on which locale is active.
export function formatBirthday(isoDate: string, locale: string): string {
  const [, month, day] = isoDate.split('-').map(Number);
  const numberFormat = new Intl.NumberFormat(locale);
  return `${numberFormat.format(day)}/${numberFormat.format(month)}`;
}

export function formatMonth(isoDate: string, locale: string): string {
  const [, month] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    timeZone: 'UTC',
  }).format(Date.UTC(2000, month - 1, 1));
}
