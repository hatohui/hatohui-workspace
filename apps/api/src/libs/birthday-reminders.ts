export const BIRTHDAY_LEAD_DAY_OPTIONS = [0, 7, 14, 30] as const;

export const MAX_BIRTHDAY_LEAD_DAYS = 365;

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
