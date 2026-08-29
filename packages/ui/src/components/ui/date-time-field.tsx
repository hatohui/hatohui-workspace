'use client';

import * as React from 'react';
import { CalendarClock, X } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

const MINUTE_STEP = 5;
const HOURS_12 = Array.from({ length: 12 }, (_, index) => index + 1);
const STEP_MINUTES = Array.from(
  { length: 60 / MINUTE_STEP },
  (_, index) => index * MINUTE_STEP,
);
const DEFAULT_HOUR_24 = 9;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function parse(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toLocalString(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function split12h(hour24: number): { hour12: number; meridiem: 'AM' | 'PM' } {
  const meridiem = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, meridiem };
}

function join24h(hour12: number, meridiem: string): number {
  if (meridiem === 'AM') return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

export interface DateTimeFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  invalid?: boolean;
  placeholder?: string;
  clearLabel?: string;
  hourLabel?: string;
  minuteLabel?: string;
  meridiemLabel?: string;
}

export function DateTimeField({
  value,
  onChange,
  id,
  invalid,
  placeholder = 'dd/mm/yyyy --:--',
  clearLabel = 'Clear',
  hourLabel = 'Hour',
  minuteLabel = 'Minute',
  meridiemLabel = 'AM or PM',
}: DateTimeFieldProps) {
  const current = parse(value);
  const { hour12, meridiem } = current
    ? split12h(current.getHours())
    : split12h(DEFAULT_HOUR_24);
  const minute = current ? current.getMinutes() : 0;

  const minuteOptions = React.useMemo(() => {
    const set = new Set<number>(STEP_MINUTES);
    set.add(minute);
    return [...set].sort((a, b) => a - b);
  }, [minute]);

  const commit = (
    date: Date,
    nextHour12: number,
    nextMeridiem: string,
    nextMinute: number,
  ) => {
    const next = new Date(date);
    next.setHours(join24h(nextHour12, nextMeridiem), nextMinute, 0, 0);
    onChange(toLocalString(next));
  };

  const baseDate = current ?? new Date();

  const display = current
    ? new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(current)
    : placeholder;

  return (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={invalid || undefined}
            className="w-full justify-start font-normal"
          >
            <CalendarClock className="size-4 shrink-0" aria-hidden />
            <span
              className={cn('truncate', !current && 'text-muted-foreground')}
            >
              {display}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto max-w-[calc(100vw-2rem)] overflow-hidden p-0"
          align="start"
        >
          <Calendar
            mode="single"
            captionLayout="label"
            defaultMonth={current ?? undefined}
            selected={current ?? undefined}
            onSelect={(date) =>
              date ? commit(date, hour12, meridiem, minute) : onChange('')
            }
            disabled={{ before: new Date() }}
          />
          <div className="flex flex-wrap items-center gap-2 border-t border-border p-3">
            <CalendarClock
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <Select
              value={String(hour12)}
              onValueChange={(next) =>
                commit(baseDate, Number(next), meridiem, minute)
              }
            >
              <SelectTrigger className="h-8 w-16" aria-label={hourLabel}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOURS_12.map((hour) => (
                  <SelectItem key={hour} value={String(hour)}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">:</span>
            <Select
              value={String(minute)}
              onValueChange={(next) =>
                commit(baseDate, hour12, meridiem, Number(next))
              }
            >
              <SelectTrigger className="h-8 w-16" aria-label={minuteLabel}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {minuteOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {pad(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={meridiem}
              onValueChange={(next) => commit(baseDate, hour12, next, minute)}
            >
              <SelectTrigger
                className="h-8 w-[4.25rem]"
                aria-label={meridiemLabel}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
      {current && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={clearLabel}
          onClick={() => onChange('')}
        >
          <X className="size-4" aria-hidden />
        </Button>
      )}
    </div>
  );
}
