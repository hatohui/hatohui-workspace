export const BIRTHDAY_LEAD_DAY_OPTIONS = [0, 7, 14, 30] as const;

export const MAX_BIRTHDAY_LEAD_DAYS = 365;

export const MAX_BIRTHDAY_REMINDER_DAYS_BEFORE = 6;

export const MAX_BIRTHDAY_REMINDER_WEEKS_BEFORE = 4;

export interface BirthdayReminderOffsets {
  daysBefore: number;
  weeksBefore: number;
}

/// Days above 6 are the weekly reminder's job, so the two controls never
/// describe the same offset twice. weeksBefore 0 means "no weekly reminder"
/// rather than "the day itself" — that case is already daysBefore 0, which is
/// also what gates the SELF_BIRTHDAY email.
export function composeLeadDays({
  daysBefore,
  weeksBefore,
}: BirthdayReminderOffsets): number[] {
  return normalizeLeadDays(
    weeksBefore > 0 ? [daysBefore, weeksBefore * 7] : [daysBefore],
  );
}

export function decomposeLeadDays(leadDays: number[]): BirthdayReminderOffsets {
  const weeks = leadDays
    .filter(
      (value) =>
        value > 0 &&
        value % 7 === 0 &&
        value / 7 <= MAX_BIRTHDAY_REMINDER_WEEKS_BEFORE,
    )
    .map((value) => value / 7);

  return {
    daysBefore:
      leadDays.find((value) => value <= MAX_BIRTHDAY_REMINDER_DAYS_BEFORE) ?? 0,
    weeksBefore: weeks.length === 0 ? 0 : Math.max(...weeks),
  };
}

export const MAX_BIRTHDAY_LEAD_DAY_ENTRIES = 6;

export function resolveLeadDays(
  stored: string | null | undefined,
  appDefaultAdvanceDays: number | null,
): number[] {
  if (stored === null || stored === undefined) {
    return normalizeLeadDays(
      appDefaultAdvanceDays === null ? [0] : [0, appDefaultAdvanceDays],
    );
  }
  return parseLeadDays(stored);
}

/// Accounts that turned reminders off before this flag existed stored an empty
/// lead-day list, so an absent flag is read back from that list rather than
/// defaulting to on and re-enabling their emails.
export function resolveRemindersEnabled(
  stored: string | null | undefined,
  leadDays: number[],
): boolean {
  if (stored === null || stored === undefined) return leadDays.length > 0;
  return stored === 'true';
}

export function serializeRemindersEnabled(enabled: boolean): string {
  return enabled ? 'true' : 'false';
}

export function parseLeadDays(value: string): number[] {
  if (value.trim() === '') return [];
  return normalizeLeadDays(value.split(',').map((part) => Number(part.trim())));
}

export function serializeLeadDays(values: number[]): string {
  return normalizeLeadDays(values).join(',');
}

export function normalizeLeadDays(values: number[]): number[] {
  return [...new Set(values)]
    .filter(
      (value) =>
        Number.isInteger(value) &&
        value >= 0 &&
        value <= MAX_BIRTHDAY_LEAD_DAYS,
    )
    .sort((a, b) => a - b)
    .slice(0, MAX_BIRTHDAY_LEAD_DAY_ENTRIES);
}
