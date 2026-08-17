import { CommissionStatus } from '@prisma/client';

export const COMMISSION_SORT_OPTIONS = [
  'createdAt',
  'deadline',
  'quote',
] as const;
export type CommissionSortOption = (typeof COMMISSION_SORT_OPTIONS)[number];

export const SORT_DIRECTIONS = ['asc', 'desc'] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export const COMMISSION_STEP_KEYS = [
  'ideaConfirmedAt',
  'sketchConfirmedAt',
  'paymentConfirmedAt',
  'lineDoneAt',
  'coloringDoneAt',
  'finishedAt',
] as const;
export type CommissionStepKey = (typeof COMMISSION_STEP_KEYS)[number];

export const QUEUE_STATUSES: CommissionStatus[] = [
  CommissionStatus.NOT_YET_STARTED,
  CommissionStatus.QUEUED,
  CommissionStatus.SKETCH,
  CommissionStatus.CONFIRMED,
  CommissionStatus.ONGOING,
];

export const QUEUE_STATUS_RANK = new Map(
  QUEUE_STATUSES.map((status, index) => [status, index]),
);

export const COMMISSION_RECEIVED_NOTIFICATION_CONFIG_TYPE =
  'art.commissionreceived.notification';
export const NEW_COMMISSION_EMAIL_TEMPLATE_CONFIG_TYPE =
  'art.commissionreceived.templateid';
export const DELIVERY_EMAIL_TEMPLATE_CONFIG_TYPE =
  'art.commissiondelivered.templateid';
