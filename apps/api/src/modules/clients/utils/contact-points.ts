import type { PreferredContactMethod, Prisma } from '@prisma/client';
import {
  CONTACT_METHOD_BY_PLATFORM,
  EMAIL_CONTACT_PLATFORM,
  OTHER_CONTACT_PLATFORM,
} from '@/modules/clients/clients.constants';

export interface ContactPoint {
  platform: string;
  value: string;
}

export function socialMediasOf(
  value: Prisma.JsonValue | null | undefined,
): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && entry[1].trim() !== '',
    ),
  );
}

export function toContactPoints(
  socialMedias: Record<string, string>,
): ContactPoint[] {
  return Object.entries(socialMedias).map(([platform, value]) => ({
    platform,
    value,
  }));
}

export function isEmailContact(contact: ContactPoint): boolean {
  return contact.platform === EMAIL_CONTACT_PLATFORM;
}

export function contactMethodFor(platform: string): PreferredContactMethod {
  return CONTACT_METHOD_BY_PLATFORM[platform] ?? 'OTHER';
}

export function platformForContactMethod(
  method: PreferredContactMethod,
): string {
  const entry = Object.entries(CONTACT_METHOD_BY_PLATFORM).find(
    ([, mapped]) => mapped === method,
  );
  return entry?.[0] ?? OTHER_CONTACT_PLATFORM;
}

export function withMissingContacts(
  target: Record<string, string>,
  source: Record<string, string>,
): Record<string, string> {
  return { ...source, ...target };
}
