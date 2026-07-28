import { format } from 'date-fns';

export function formatDate(date: Date, formatStr: string) {
  return format(date, formatStr);
}
