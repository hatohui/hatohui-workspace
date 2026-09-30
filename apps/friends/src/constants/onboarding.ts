export const CONNECTIONS_SEARCH_DEBOUNCE_MS = 300;
export const CONNECTIONS_PAGE_SIZE = 5;

export type FriendsOnboardingStep =
  'visibility' | 'birthday' | 'timezone' | 'connections';

export const FRIENDS_ONBOARDING_FIRST_STEP: FriendsOnboardingStep =
  'visibility';
