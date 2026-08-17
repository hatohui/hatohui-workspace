import { useState } from 'react';
import { useAuth } from '@hatohui/libs';
import { useUpdateMe } from '@hatohui/models';
import {
  MAX_BIRTHDAY_REMINDER_DAYS_BEFORE,
  MAX_BIRTHDAY_REMINDER_WEEKS_BEFORE,
  MIN_BIRTHDAY_REMINDER_DAYS_BEFORE,
  MIN_BIRTHDAY_REMINDER_WEEKS_BEFORE,
} from '../constants/birthdayReminders';

export interface BirthdayReminderOffsets {
  daysBefore: number;
  weeksBefore: number;
  isEnabled: boolean;
}

export interface BirthdayReminderOffsetsState extends BirthdayReminderOffsets {
  isSaving: boolean;
  isReady: boolean;
  setDaysBefore: (value: number) => void;
  setWeeksBefore: (value: number) => void;
  setEnabled: (value: boolean) => void;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(Math.trunc(value), min), max);
}

export function useBirthdayReminderOffsets(): BirthdayReminderOffsetsState {
  const { user, refetchUser } = useAuth();
  const { mutate, isPending } = useUpdateMe();
  const [pending, setPending] = useState<BirthdayReminderOffsets | null>(null);

  const current: BirthdayReminderOffsets = pending ?? {
    daysBefore: user?.birthdayReminderDaysBefore ?? 0,
    weeksBefore: user?.birthdayReminderWeeksBefore ?? 0,
    isEnabled: user?.birthdayRemindersEnabled ?? false,
  };

  const save = (next: BirthdayReminderOffsets) => {
    setPending(next);
    mutate(
      {
        data: {
          birthdayReminderDaysBefore: next.daysBefore,
          birthdayReminderWeeksBefore: next.weeksBefore,
          birthdayRemindersEnabled: next.isEnabled,
        },
      },
      {
        onSuccess: () => {
          void refetchUser().finally(() => setPending(null));
        },
        onError: () => setPending(null),
      },
    );
  };

  return {
    ...current,
    isSaving: isPending,
    isReady: Boolean(user),
    setEnabled: (value) => save({ ...current, isEnabled: value }),
    setDaysBefore: (value) =>
      save({
        ...current,
        daysBefore: clamp(
          value,
          MIN_BIRTHDAY_REMINDER_DAYS_BEFORE,
          MAX_BIRTHDAY_REMINDER_DAYS_BEFORE,
        ),
      }),
    setWeeksBefore: (value) =>
      save({
        ...current,
        weeksBefore: clamp(
          value,
          MIN_BIRTHDAY_REMINDER_WEEKS_BEFORE,
          MAX_BIRTHDAY_REMINDER_WEEKS_BEFORE,
        ),
      }),
  };
}
