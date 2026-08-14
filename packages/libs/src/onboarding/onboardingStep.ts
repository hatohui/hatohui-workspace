export type OnboardingStep =
  | 'optIn'
  | 'profile'
  | 'handle'
  | 'visibility'
  | 'birthday'
  | 'timezone'
  | 'connections'
  | 'complete';

/// 'identity' mode only walks optIn -> profile -> handle -> complete, for
/// apps that just need to establish who a user is (no birthday directory
/// concepts). 'full' mode is the original friends-app flow.
export type OnboardingMode = 'full' | 'identity';

export const ONBOARDING_STEP_STORAGE_PREFIX = 'onboarding.step.';
