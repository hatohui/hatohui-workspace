export const ARTIST_SETUP_STEPS = [
  'payment',
  'pricing',
  'examples',
  'opening',
] as const;
export type ArtistSetupStep = (typeof ARTIST_SETUP_STEPS)[number];

export const SETUP_ROUTE = '/app/setup';
export const SETUP_STEP_PARAM = 'step';
