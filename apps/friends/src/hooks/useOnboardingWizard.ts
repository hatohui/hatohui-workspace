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
} from '@hatohui/models';
import { useAuth } from '@hatohui/libs';
import { useOnboardingModal } from './useOnboardingModal';
import {
  ONBOARDING_STEP_STORAGE_PREFIX,
  type OnboardingStep,
} from '../constants/onboarding';
import type { Visibility } from '../constants/visibility';

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

/// Every action here is optimistic: the UI (step/modal) updates immediately
/// and the mutation fires in the background, rather than waiting for the
/// response. Errors are logged, not surfaced — this app has no toast system
/// yet, so a failed background write currently fails silently. Good enough
/// for a personal-scale app, but a real error surface is a follow-up.
export function useOnboardingWizard() {
  const { user } = useAuth();
  const { close } = useOnboardingModal();
  const stateQuery = useOnboardingState({ query: { enabled: !!user } });

  const [stepOverride, setStepOverride] = useState<OnboardingStep | null>(null);
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

  const optIn = useOnboardingOptIn();
  const setProfile = useOnboardingSetProfile();
  const setVisibility = useOnboardingSetVisibility();
  const setBirthday = useOnboardingSetBirthday();
  const addConnections = useOnboardingAddConnections();
  const complete = useOnboardingComplete();
  const skip = useOnboardingSkip();

  return {
    entry,
    isLoading: stateQuery.isLoading,
    step,

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
      setStep('visibility');
      setProfile.mutate({ data: { name, avatarKey } });
    },

    submitVisibility: (visibility: Visibility) => {
      setStep(visibility === 'NONE' ? 'connections' : 'birthday');
      setVisibility.mutate({ data: { visibility } });
    },

    submitBirthday: (data: {
      birthYear?: number;
      birthMonth: number;
      birthDay: number;
    }) => {
      setStep('connections');
      setBirthday.mutate({ data });
    },

    submitConnections: (birthdayDetailsIds: string[]) => {
      setStep('complete');
      if (birthdayDetailsIds.length > 0) {
        addConnections.mutate({ data: { birthdayDetailsIds } });
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
