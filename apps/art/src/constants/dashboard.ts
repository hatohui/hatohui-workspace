import { CircleCheck, Hourglass, Inbox, Wallet } from 'lucide-react';

export const DASHBOARD_ROUTES = {
  requests: '/app/requests',
  opening: '/app/commission-opening',
  settings: '/app/commission-settings',
} as const;

export const GREETING_HOURS = { afternoon: 12, evening: 18 } as const;

export const DEADLINE_URGENT_DAYS = 3;

export const DAY_MS = 86_400_000;

export const DASHBOARD_STAT_KEYS = [
  'pending',
  'inProgress',
  'completed',
  'paidThisMonth',
] as const;
export type DashboardStatKey = (typeof DASHBOARD_STAT_KEYS)[number];

export const DASHBOARD_STAT_ICONS: Record<DashboardStatKey, typeof Inbox> = {
  pending: Inbox,
  inProgress: Hourglass,
  completed: CircleCheck,
  paidThisMonth: Wallet,
};
