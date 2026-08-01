import {
  CommissionDtoStatus,
  CommissionDtoPaymentStatus,
  CommissionsSort,
  CommissionsDirection,
} from '@hatohui/models';

export const COMMISSION_STATUS_OPTIONS = Object.values(CommissionDtoStatus);
export const PAYMENT_STATUS_OPTIONS = Object.values(CommissionDtoPaymentStatus);

export const COMMISSION_KANBAN_COLUMNS: CommissionDtoStatus[] = [
  CommissionDtoStatus.NOT_YET_STARTED,
  CommissionDtoStatus.QUEUED,
  CommissionDtoStatus.SKETCH,
  CommissionDtoStatus.CONFIRMED,
  CommissionDtoStatus.ONGOING,
  CommissionDtoStatus.COMPLETED,
  CommissionDtoStatus.CANCELLED,
];

export const COMMISSION_SORT_OPTIONS = Object.values(CommissionsSort);
export const COMMISSION_SORT_DIRECTIONS = Object.values(CommissionsDirection);

export const COMMISSION_STEP_KEYS = [
  'ideaConfirmedAt',
  'sketchConfirmedAt',
  'paymentConfirmedAt',
  'lineDoneAt',
  'coloringDoneAt',
  'finishedAt',
] as const;
export type CommissionStepKey = (typeof COMMISSION_STEP_KEYS)[number];

export const COMMISSION_PAGE_SIZE = 20;

export const PREFERRED_CONTACT_METHODS = [
  'EMAIL',
  'DISCORD',
  'TELEGRAM',
  'TWITTER',
  'OTHER',
] as const;
