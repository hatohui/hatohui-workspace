import { timingSafeEqual } from 'node:crypto';

export const ADMIN_KEY_HEADER = 'x-admin-key';

export function adminKeyMatches(provided: unknown, expected: string): boolean {
  if (typeof provided !== 'string') return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
