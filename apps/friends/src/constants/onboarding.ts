export type OnboardingStep =
  | 'optIn'
  | 'profile'
  | 'visibility'
  | 'birthday'
  | 'connections'
  | 'complete';

export const ONBOARDING_STEP_STORAGE_PREFIX = 'friends.onboarding.step.';
