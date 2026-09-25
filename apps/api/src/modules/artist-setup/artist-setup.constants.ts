export const ARTIST_SETUP_STEPS = [
  'payment',
  'pricing',
  'examples',
  'opening',
] as const;
export type ArtistSetupStep = (typeof ARTIST_SETUP_STEPS)[number];
