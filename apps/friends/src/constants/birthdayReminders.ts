export const BIRTHDAY_REMINDER_LEAD_DAYS = [0, 7, 14, 30] as const;

export type BirthdayReminderLeadDay =
  (typeof BIRTHDAY_REMINDER_LEAD_DAYS)[number];

export const BIRTHDAY_REMINDER_LABEL_KEYS: Record<
  BirthdayReminderLeadDay,
  string
> = {
  0: 'settings.notifications.onTheDay',
  7: 'settings.notifications.oneWeek',
  14: 'settings.notifications.twoWeeks',
  30: 'settings.notifications.oneMonth',
};

export const MIN_BIRTHDAY_REMINDER_DAYS_BEFORE = 0;

export const MAX_BIRTHDAY_REMINDER_DAYS_BEFORE = 6;

export const MIN_BIRTHDAY_REMINDER_WEEKS_BEFORE = 0;

export const MAX_BIRTHDAY_REMINDER_WEEKS_BEFORE = 4;
