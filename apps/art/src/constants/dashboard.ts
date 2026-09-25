import { CircleCheck, Hourglass, Inbox, Wallet } from 'lucide-react';

export const DASHBOARD_ROUTES = {
  commissions: '/app/commissions',
  requests: '/app/commissions?tab=requests',
  queue: '/app/commissions?tab=queue',
  past: '/app/commissions?tab=past',
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

export const DASHBOARD_STAT_HREFS: Partial<Record<DashboardStatKey, string>> = {
  pending: DASHBOARD_ROUTES.requests,
  inProgress: DASHBOARD_ROUTES.queue,
  completed: DASHBOARD_ROUTES.past,
};

export const DASHBOARD_STAT_ICONS: Record<DashboardStatKey, typeof Inbox> = {
  pending: Inbox,
  inProgress: Hourglass,
  completed: CircleCheck,
  paidThisMonth: Wallet,
};
