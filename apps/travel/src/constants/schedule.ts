export const WEEKDAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export const HOLIDAY_COUNTRIES = [
  { code: 'VN', label: 'Vietnam' },
  { code: 'SG', label: 'Singapore' },
  { code: 'JP', label: 'Japan' },
  { code: 'TH', label: 'Thailand' },
  { code: 'MY', label: 'Malaysia' },
  { code: 'KR', label: 'South Korea' },
  { code: 'TW', label: 'Taiwan' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
] as const;

export const DEFAULT_ANNUAL_LEAVE_DAYS = 12;
export const DEFAULT_SICK_LEAVE_DAYS = 5;
export const CALENDAR_COLUMNS = 7;
export const HEATMAP_WEEKS = 53;
