import { TravelLeaveType } from '@prisma/client';

export const DEFAULT_GROUP_NAME = 'My Plan';
export const DEFAULT_ADMIN_GROUPS_LIMIT = 20;
export const TRAVEL_LEAVE_TYPES = [
  TravelLeaveType.ANNUAL,
  TravelLeaveType.SICK,
  TravelLeaveType.UNPAID,
] as const;
