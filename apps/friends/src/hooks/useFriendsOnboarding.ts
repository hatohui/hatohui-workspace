import { useState } from 'react';
import {
  useOnboardingAddConnections,
  useOnboardingSetBirthday,
  useOnboardingSetVisibility,
  useUpdateMe,
} from '@hatohui/models';
import { detectTimezone, useAuth, type OnboardingStep } from '@hatohui/libs';
import type { Visibility } from '../constants/visibility';

export function useFriendsOnboarding(
  goTo: (next: OnboardingStep) => void,
  onEntityChanged: () => void,
) {
  const { refetchUser } = useAuth();
  const onChanged = { onSuccess: onEntityChanged };
  const [birthdayVisibility, setBirthdayVisibility] =
    useState<Visibility>('PUBLIC');

  const setVisibility = useOnboardingSetVisibility({ mutation: onChanged });
  const setBirthday = useOnboardingSetBirthday({ mutation: onChanged });
  const addConnections = useOnboardingAddConnections({ mutation: onChanged });
  const updateMe = useUpdateMe();

  return {
    initialTimezone: detectTimezone(),
    isSubmittingTimezone: updateMe.isPending,

    submitVisibility: (visibility: Visibility) => {
      setBirthdayVisibility(visibility);
      goTo(visibility === 'NONE' ? 'connections' : 'birthday');
      setVisibility.mutate({ data: { visibility } });
    },

    submitBirthday: (data: {
      birthYear?: number;
      birthMonth: number;
      birthDay: number;
    }) => {
      goTo('timezone');
      setBirthday.mutate({ data: { ...data, visibility: birthdayVisibility } });
    },

    submitTimezone: (timezone: string) => {
      goTo('connections');
      updateMe.mutate(
        { data: { timezone } },
        { onSuccess: () => void refetchUser() },
      );
    },

    submitConnections: (userIds: string[]) => {
      goTo('complete');
      if (userIds.length > 0) {
        addConnections.mutate({ data: { userIds } });
      }
    },
  };
}
