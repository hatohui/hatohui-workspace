import type { PreferredContactMethod } from '@prisma/client';

export const EMAIL_CONTACT_PLATFORM = 'email';

export const OTHER_CONTACT_PLATFORM = 'Other';

export const IDENTITY_MATCH_LIMIT = 3;

export const CONTACT_METHOD_BY_PLATFORM: Record<
  string,
  PreferredContactMethod
> = {
  [EMAIL_CONTACT_PLATFORM]: 'EMAIL',
  Discord: 'DISCORD',
  Telegram: 'TELEGRAM',
  'X (Twitter)': 'TWITTER',
};
