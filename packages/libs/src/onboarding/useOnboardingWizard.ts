import { useState } from 'react';
import {
  useOnboardingAddConnections,
  useOnboardingComplete,
  useOnboardingOptIn,
  useOnboardingSetBirthday,
  useOnboardingSetProfile,
  useOnboardingSetVisibility,
  useOnboardingSkip,
  useOnboardingState,
  useUpdateMe,
} from '@hatohui/models';
import { useAuth } from '../auth/AuthContext';
import { useOnboardingModal } from './useOnboardingModal';
import {
  ONBOARDING_STEP_STORAGE_PREFIX,
  type OnboardingMode,
  type OnboardingStep,
} from './onboardingStep';
import type { Visibility } from './visibility';

function readStoredStep(userId: string): OnboardingStep | null {
  const value = localStorage.getItem(ONBOARDING_STEP_STORAGE_PREFIX + userId);
  return (value as OnboardingStep | null) ?? null;
}

function writeStoredStep(userId: string, step: OnboardingStep): void {
  localStorage.setItem(ONBOARDING_STEP_STORAGE_PREFIX + userId, step);
}

function clearStoredStep(userId: string): void {
  localStorage.removeItem(ONBOARDING_STEP_STORAGE_PREFIX + userId);
}

/// `mode: 'identity'` (art, www, ...) only walks optIn -> profile -> handle
/// -> complete — no birthday-directory concepts. `mode: 'full'` (friends)
/// keeps the original visibility/birthday/connections steps.
/// `onEntityChanged` lets the consuming app invalidate its own query cache
/// (e.g. friends invalidates its `/friends` queries) without this shared
/// hook needing to know that app's query-key scheme.
export function useOnboardingWizard(
  mode: OnboardingMode = 'full',
  onEntityChanged?: () => void,
) {
  const { user, refetchUser } = useAuth();
  const { close } = useOnboardingModal();
  const stateQuery = useOnboardingState({ query: { enabled: !!user } });
  const onChanged = { onSuccess: () => onEntityChanged?.() };

  const [stepOverride, setStepOverride] = useState<OnboardingStep | null>(null);
  // Visibility governs the birthday, which does not exist yet when it is
  // chosen, so it rides along to the birthday step.
  const [birthdayVisibility, setBirthdayVisibility] =
    useState<Visibility>('PUBLIC');
  const entry = stateQuery.data?.data.entry ?? null;
  const defaultStep: OnboardingStep = entry ? 'profile' : 'optIn';
  const step =
    stepOverride ?? (user ? readStoredStep(user.id) : null) ?? defaultStep;

  const setStep = (next: OnboardingStep) => {
    if (user) writeStoredStep(user.id, next);
    setStepOverride(next);
  };

  const finish = () => {
    if (user) clearStoredStep(user.id);
    close();
  };

  const optIn = useOnboardingOptIn({ mutation: onChanged });
  const setProfile = useOnboardingSetProfile({ mutation: onChanged });
  const updateMe = useUpdateMe();
  const setVisibility = useOnboardingSetVisibility({ mutation: onChanged });
  const setBirthday = useOnboardingSetBirthday({ mutation: onChanged });
  const addConnections = useOnboardingAddConnections({ mutation: onChanged });
  const complete = useOnboardingComplete({ mutation: onChanged });
  const skip = useOnboardingSkip({ mutation: onChanged });

  return {
    entry,
    isLoading: stateQuery.isLoading,
    step,
    isSubmittingHandle: updateMe.isPending,
    isSubmittingTimezone: updateMe.isPending,
    handleError: updateMe.error,

    submitOptIn: (join: boolean) => {
      if (!join) {
        finish();
        skip.mutate();
        return;
      }
      setStep('profile');
      optIn.mutate({ data: { join } });
    },

    submitProfile: (name: string, avatarKey?: string) => {
      setStep('handle');
      setProfile.mutate(
        { data: { name, avatarKey } },
        { onSuccess: () => void refetchUser() },
      );
    },

    submitHandle: (handle?: string) => {
      const next: OnboardingStep =
        mode === 'identity' ? 'complete' : 'visibility';
      if (!handle) {
        setStep(next);
        return;
      }
      updateMe.mutate(
        { data: { handle } },
        {
          onSuccess: () => {
            setStep(next);
            void refetchUser();
          },
        },
      );
    },

    submitVisibility: (visibility: Visibility) => {
      setBirthdayVisibility(visibility);
      setStep(visibility === 'NONE' ? 'connections' : 'birthday');
      setVisibility.mutate({ data: { visibility } });
    },

    submitBirthday: (data: {
      birthYear?: number;
      birthMonth: number;
      birthDay: number;
    }) => {
      setStep('timezone');
      setBirthday.mutate({ data: { ...data, visibility: birthdayVisibility } });
    },

    submitTimezone: (timezone: string) => {
      setStep('connections');
      updateMe.mutate(
        { data: { timezone } },
        { onSuccess: () => void refetchUser() },
      );
    },

    submitConnections: (userIds: string[]) => {
      setStep('complete');
      if (userIds.length > 0) {
        addConnections.mutate({ data: { userIds } });
      }
    },

    submitComplete: () => {
      finish();
      complete.mutate();
    },

    submitSkip: () => {
      finish();
      skip.mutate();
    },
  };
}
