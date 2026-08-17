export const BIRTHDAY_CONFIG_TYPES = {
  reminderDays: 'friends.birthday.reminderdays',
  dailySendCap: 'friends.birthday.dailysendcap',
  senderEmail: 'friends.birthday.senderemail',
  senderName: 'friends.birthday.sendername',
  avatarUrl: 'friends.birthday.avatarurl',
} as const;

export const MAX_ATTEMPTS = 3;
export const SENT_RETENTION_DAYS = 7;

export const APP_URL = 'friends.hatohui.com';

/// Georgia is deliberately absent: it has no precomposed Vietnamese glyphs, so
/// names like "Quốc" render with a displaced accent. Every face listed here was
/// checked against Vietnamese, Japanese and Korean sample names.
export const SERIF =
  "'Palatino Linotype','Book Antiqua',Palatino,Constantia,'Times New Roman',serif";
export const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
