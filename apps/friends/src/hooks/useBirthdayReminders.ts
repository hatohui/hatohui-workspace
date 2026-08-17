import { useState } from 'react';
import { useAuth } from '@hatohui/libs';
import { useUpdateMe } from '@hatohui/models';
import type { BirthdayReminderLeadDay } from '../constants/birthdayReminders';

export interface BirthdayRemindersState {
  selected: number[];
  isSaving: boolean;
  isReady: boolean;
  toggle: (leadDay: BirthdayReminderLeadDay) => void;
}

export function useBirthdayReminders(): BirthdayRemindersState {
  const { user, refetchUser } = useAuth();
  const { mutate, isPending } = useUpdateMe();
  const [pending, setPending] = useState<number[] | null>(null);

  const selected = pending ?? user?.birthdayReminderLeadDays ?? [];

  const toggle = (leadDay: BirthdayReminderLeadDay) => {
    const next = selected.includes(leadDay)
      ? selected.filter((day) => day !== leadDay)
      : [...selected, leadDay].sort((a, b) => a - b);

    setPending(next);
    mutate(
      { data: { birthdayReminderLeadDays: next } },
      {
        onSuccess: () => {
          void refetchUser().finally(() => setPending(null));
        },
        onError: () => setPending(null),
      },
    );
  };

  return {
    selected,
    isSaving: isPending,
    isReady: Boolean(user),
    toggle,
  };
}
