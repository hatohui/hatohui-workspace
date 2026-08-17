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
