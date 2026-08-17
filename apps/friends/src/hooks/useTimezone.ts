import { useMemo, useState } from 'react';
import { useAuth, detectTimezone, timezoneOptions } from '@hatohui/libs';
import { useUpdateMe } from '@hatohui/models';
import type { SearchableSelectOption } from '@hatohui/ui';

export interface TimezoneState {
  timezone: string | null;
  options: SearchableSelectOption[];
  isReady: boolean;
  setTimezone: (value: string) => void;
}

export function useTimezone(): TimezoneState {
  const { user, refetchUser } = useAuth();
  const { mutate } = useUpdateMe();
  const [pending, setPending] = useState<string | null>(null);

  const timezone = pending ?? user?.timezone ?? null;
  const options = useMemo(
    () => timezoneOptions(timezone ?? detectTimezone()),
    [timezone],
  );

  return {
    timezone,
    options,
    isReady: Boolean(user),
    setTimezone: (value) => {
      setPending(value);
      mutate(
        { data: { timezone: value } },
        {
          onSuccess: () => {
            void refetchUser().finally(() => setPending(null));
          },
          onError: () => setPending(null),
        },
      );
    },
  };
}
