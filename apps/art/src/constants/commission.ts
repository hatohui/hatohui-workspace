import {
  CommissionDtoStatus,
  CommissionDtoPaymentStatus,
  CommissionOpeningDtoStatus,
  CommissionsSort,
  CommissionsDirection,
} from '@hatohui/models';
import type { CommissionOpeningDto } from '@hatohui/models';

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

export const TRIAGE_TABS: CommissionDtoStatus[] = [
  CommissionDtoStatus.PENDING,
  CommissionDtoStatus.ACCEPTED,
  CommissionDtoStatus.DECLINED,
];

/// Only the sort modes the PRD's triage use case actually asks for —
/// first-come-first-serve (createdAt), custom priority, and by-deadline.
export const TRIAGE_SORT_OPTIONS: CommissionsSort[] = [
  CommissionsSort.createdAt,
  CommissionsSort.priority,
  CommissionsSort.deadline,
];

export const TRIAGE_VIEW_MODES = ['card', 'table'] as const;
export type TriageViewMode = (typeof TRIAGE_VIEW_MODES)[number];

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

export const OPENING_ACTIVE_STATUSES: CommissionOpeningDto['status'][] = [
  CommissionOpeningDtoStatus.OPEN,
  CommissionOpeningDtoStatus.SCHEDULED,
];

export const OPENING_DASHBOARD_TABS = ['overview', 'history'] as const;
export type OpeningDashboardTab = (typeof OPENING_DASHBOARD_TABS)[number];

export const OPENING_SAVED_FLASH_MS = 2500;

export const PREFERRED_CONTACT_METHODS = [
  'EMAIL',
  'DISCORD',
  'TELEGRAM',
  'TWITTER',
  'OTHER',
] as const;

export const EMPTY_COMMISSION_IDEA: { type: string; content: never[] } = {
  type: 'doc',
  content: [],
};
