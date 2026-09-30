import type { ReactNode } from 'react';

export type CoreOnboardingStep = 'optIn' | 'profile' | 'handle' | 'complete';

export type OnboardingStep = CoreOnboardingStep | (string & {});

export const CORE_ONBOARDING_STEPS: readonly CoreOnboardingStep[] = [
  'optIn',
  'profile',
  'handle',
  'complete',
];

export function isCoreOnboardingStep(
  step: OnboardingStep,
): step is CoreOnboardingStep {
  return (CORE_ONBOARDING_STEPS as readonly string[]).includes(step);
}

export type RenderOnboardingStep = (
  step: OnboardingStep,
  goTo: (next: OnboardingStep) => void,
) => ReactNode;

export const ONBOARDING_STEP_STORAGE_PREFIX = 'onboarding.step.';
