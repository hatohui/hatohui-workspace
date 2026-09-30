import { useState } from 'react';
import {
  useOnboardingComplete,
  useOnboardingOptIn,
  useOnboardingSetProfile,
  useOnboardingSkip,
  useOnboardingState,
  useUpdateMe,
} from '@hatohui/models';
import { useAuth } from '../auth/AuthContext';
import { useOnboardingModal } from './useOnboardingModal';
import {
  ONBOARDING_STEP_STORAGE_PREFIX,
  type OnboardingStep,
} from './onboardingStep';

function readStoredStep(userId: string): OnboardingStep | null {
  return localStorage.getItem(ONBOARDING_STEP_STORAGE_PREFIX + userId);
}

function writeStoredStep(userId: string, step: OnboardingStep): void {
  localStorage.setItem(ONBOARDING_STEP_STORAGE_PREFIX + userId, step);
}

function clearStoredStep(userId: string): void {
  localStorage.removeItem(ONBOARDING_STEP_STORAGE_PREFIX + userId);
}

export type UseOnboardingWizardOptions = {
  afterHandle?: OnboardingStep;
  onEntityChanged?: () => void;
};

export function useOnboardingWizard({
  afterHandle = 'complete',
  onEntityChanged,
}: UseOnboardingWizardOptions = {}) {
  const { user, refetchUser } = useAuth();
  const { close } = useOnboardingModal();
  const stateQuery = useOnboardingState({ query: { enabled: !!user } });
  const onChanged = { onSuccess: () => onEntityChanged?.() };

  const [stepOverride, setStepOverride] = useState<OnboardingStep | null>(null);
  const entry = stateQuery.data?.data.entry ?? null;
  const defaultStep: OnboardingStep = entry ? 'profile' : 'optIn';
  const step =
    stepOverride ?? (user ? readStoredStep(user.id) : null) ?? defaultStep;

  const goTo = (next: OnboardingStep) => {
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
  const complete = useOnboardingComplete({ mutation: onChanged });
  const skip = useOnboardingSkip({ mutation: onChanged });

  return {
    entry,
    isLoading: stateQuery.isLoading,
    step,
    goTo,
    isSubmittingHandle: updateMe.isPending,
    handleError: updateMe.error,

    submitOptIn: (join: boolean) => {
      if (!join) {
        finish();
        skip.mutate();
        return;
      }
      goTo('profile');
      optIn.mutate({ data: { join } });
    },

    submitProfile: (name: string, avatarKey?: string) => {
      goTo('handle');
      setProfile.mutate(
        { data: { name, avatarKey } },
        { onSuccess: () => void refetchUser() },
      );
    },

    submitHandle: (handle?: string) => {
      if (!handle) {
        goTo(afterHandle);
        return;
      }
      updateMe.mutate(
        { data: { handle } },
        {
          onSuccess: () => {
            goTo(afterHandle);
            void refetchUser();
          },
        },
      );
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
