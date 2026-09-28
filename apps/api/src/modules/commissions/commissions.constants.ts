import { CommissionStatus } from '@prisma/client';

export const COMMISSION_SORT_OPTIONS = [
  'createdAt',
  'deadline',
  'quote',
  'priority',
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

export const QUEUE_WORK_ORDER: CommissionStatus[] = [
  CommissionStatus.ONGOING,
  CommissionStatus.CONFIRMED,
  CommissionStatus.SKETCH,
  CommissionStatus.QUEUED,
  CommissionStatus.NOT_YET_STARTED,
];

export const QUEUE_STATUS_RANK = new Map(
  QUEUE_WORK_ORDER.map((status, index) => [status, index]),
);

export const QUEUE_STAGES = [
  'WAITING',
  'SKETCHING',
  'SKETCH_APPROVED',
  'IN_PROGRESS',
] as const;
export type QueueStage = (typeof QUEUE_STAGES)[number];

export const QUEUE_STAGE_BY_STATUS: Partial<
  Record<CommissionStatus, QueueStage>
> = {
  [CommissionStatus.NOT_YET_STARTED]: 'WAITING',
  [CommissionStatus.QUEUED]: 'WAITING',
  [CommissionStatus.SKETCH]: 'SKETCHING',
  [CommissionStatus.CONFIRMED]: 'SKETCH_APPROVED',
  [CommissionStatus.ONGOING]: 'IN_PROGRESS',
};

export const NEW_COMMISSION_EMAIL_TEMPLATE_CONFIG_TYPE =
  'art.commissionreceived.templateid';
export const DELIVERY_EMAIL_TEMPLATE_CONFIG_TYPE =
  'art.commissiondelivered.templateid';
export const CONFIRMATION_EMAIL_TEMPLATE_CONFIG_TYPE =
  'art.commissionconfirmation.templateid';
export const QUOTE_EMAIL_TEMPLATE_CONFIG_TYPE =
  'art.commissionquote.templateid';

export const COMMISSION_VIEWS = ['requests', 'active', 'past'] as const;
export type CommissionView = (typeof COMMISSION_VIEWS)[number];

export const COMMISSION_VIEW_STATUSES: Record<
  CommissionView,
  CommissionStatus[]
> = {
  requests: [CommissionStatus.PENDING],
  active: [CommissionStatus.ACCEPTED, ...QUEUE_STATUSES],
  past: [
    CommissionStatus.DECLINED,
    CommissionStatus.COMPLETED,
    CommissionStatus.CANCELLED,
  ],
};

export const REFERENCE_URL_LIMIT = 10;
export const REFERENCE_URL_OPTIONS = {
  protocols: ['http', 'https'],
  require_protocol: true,
};

export const COMMISSION_MIN_DEADLINE_DAYS = 3;
export const DEADLINE_TIMEZONE_SLACK_DAYS = 1;
