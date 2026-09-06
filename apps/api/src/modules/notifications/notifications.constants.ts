import { NotificationType } from '@prisma/client';

/// Types whose subject is a Connection row that may since have been
/// disconnected — those get hidden rather than shown against a dead entity.
/// CONNECTION_REJECTED(_BY_YOU) reference a connection that's *always*
/// gone (rejecting deletes the row), so they're exempt from this lookup.
export const CONNECTION_LIFECYCLE_TYPES = new Set<NotificationType>([
  NotificationType.CONNECTION_REQUEST,
  NotificationType.CONNECTION_ACCEPTED,
  NotificationType.CONNECTION_ACCEPTED_BY_YOU,
]);

export const UNREAD_COUNT_TTL_SECONDS = 300;

/// Types that earn an email to the recipient. The `*_BY_YOU` self-history
/// items and BIRTHDAY_REMINDER are excluded by design — the former are the
/// viewer's own actions, the latter is already emailed through EmailOutbox.
/// A decline stays in-app only.
export const EMAILED_NOTIFICATION_TYPES = new Set<NotificationType>([
  NotificationType.CONNECTION_REQUEST,
  NotificationType.CONNECTION_ACCEPTED,
  NotificationType.SYSTEM,
]);

export const NOTIFICATION_SENDER_CONFIG_TYPES = {
  senderEmail: 'friends.notifications.senderemail',
  senderName: 'friends.notifications.sendername',
} as const;

/// A queued email older than this is dropped by the cron: the in-app
/// notification still stands, and a days-late email is noise.
export const NOTIFICATION_EMAIL_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

export const NOTIFICATION_APP_URL = 'friends.hatohui.com';
