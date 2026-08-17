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
