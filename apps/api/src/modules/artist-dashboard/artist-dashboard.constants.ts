import { CommissionStatus } from '@prisma/client';

export const DASHBOARD_LIST_SIZE = 5;

export const IN_PROGRESS_STATUSES: CommissionStatus[] = [
  CommissionStatus.ACCEPTED,
  CommissionStatus.NOT_YET_STARTED,
  CommissionStatus.QUEUED,
  CommissionStatus.SKETCH,
  CommissionStatus.CONFIRMED,
  CommissionStatus.ONGOING,
];
