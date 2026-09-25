'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import {
  useArtistDashboard,
  type ArtistDashboardDto,
  type CommissionDto,
} from '@hatohui/models';
import {
  DASHBOARD_STAT_HREFS,
  DAY_MS,
  DEADLINE_URGENT_DAYS,
  GREETING_HOURS,
  type DashboardStatKey,
} from '@/constants/dashboard';
import { useCommissionFormatters } from './useCommissionFormatters';

function greetingKey(hour: number) {
  if (hour >= GREETING_HOURS.evening) return 'evening';
  if (hour >= GREETING_HOURS.afternoon) return 'afternoon';
  return 'morning';
}

function daysUntil(value: string, now: number) {
  return Math.ceil((new Date(value).getTime() - now) / DAY_MS);
}

export function useArtistDashboardView() {
  const { t, i18n } = useTranslation('art');
  const { user } = useAuth();
  const format = useCommissionFormatters();
  const query = useArtistDashboard();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  const data: ArtistDashboardDto | undefined = query.data?.data;

  const relative = new Intl.RelativeTimeFormat(i18n.language, {
    numeric: 'auto',
  });

  const toRequest = (item: CommissionDto) => ({
    id: item.id,
    clientName: item.clientName,
    initials: item.clientName.slice(0, 1).toUpperCase(),
    type: format.type(item.commissionTypeKey, item.commissionTypeLabel),
    status: item.status,
    submitted: relative.format(daysUntil(item.createdAt, now), 'day'),
  });

  const toDeadline = (item: CommissionDto) => {
    const days = daysUntil(item.deadline ?? item.createdAt, now);
    const date = new Date(item.deadline ?? item.createdAt);
    return {
      id: item.id,
      clientName: item.clientName,
      type: format.type(item.commissionTypeKey, item.commissionTypeLabel),
      day: date.toLocaleDateString(i18n.language, { day: 'numeric' }),
      month: date.toLocaleDateString(i18n.language, { month: 'short' }),
      dueLabel:
        days < 0
          ? t('app.dashboard.deadlines.overdue')
          : relative.format(days, 'day'),
      urgent: days <= DEADLINE_URGENT_DAYS,
    };
  };

  const opening = data?.opening ?? null;
  const pending = data?.counts.pending ?? 0;
  const taken = opening?.slotsTaken ?? 0;

  const slotSummary = opening?.slotCap
    ? t('app.dashboard.opening.slotsOfCap', {
        taken,
        cap: opening.slotCap,
        left: Math.max(0, opening.slotCap - taken),
      })
    : taken > 0
      ? t('app.dashboard.opening.accepted', { count: taken })
      : t('app.dashboard.opening.noneTaken');

  const attention =
    pending > 0
      ? t('app.dashboard.attention.waiting', { count: pending })
      : opening?.status === 'OPEN'
        ? t('app.dashboard.attention.openQuiet')
        : null;

  return {
    isLoading: query.isPending,
    greeting: t(
      `app.dashboard.greeting.${greetingKey(new Date(now).getHours())}`,
      {
        name: user?.name?.split(' ')[0] ?? '',
      },
    ),
    today: new Date(now).toLocaleDateString(i18n.language, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
    attention,
    hasWaiting: pending > 0,
    stats: data
      ? (
          [
            {
              key: 'pending',
              value: String(data.counts.pending),
              highlight: data.counts.pending > 0,
            },
            {
              key: 'inProgress',
              value: String(data.counts.inProgress),
              highlight: false,
            },
            {
              key: 'completed',
              value: String(data.counts.completed),
              highlight: false,
            },
            {
              key: 'paidThisMonth',
              value: format.money(data.earnings.paidThisMonth, data.currency),
              highlight: false,
              caption: t('app.dashboard.stats.inProgressValue', {
                amount: format.money(
                  data.earnings.inProgressValue,
                  data.currency,
                ),
              }),
            },
          ] satisfies {
            key: DashboardStatKey;
            value: string;
            highlight: boolean;
            caption?: string;
          }[]
        ).map((stat) => ({ ...stat, href: DASHBOARD_STAT_HREFS[stat.key] }))
      : [],
    opening: {
      status: opening?.status ?? 'CLOSED',
      slotsTaken: opening?.slotsTaken ?? 0,
      slotCap: opening?.slotCap ?? null,
      slotSummary,
      fill:
        opening?.slotCap != null
          ? Math.min(
              100,
              Math.round(((opening.slotsTaken ?? 0) / opening.slotCap) * 100),
            )
          : null,
      since: opening?.openedAt ? format.date(opening.openedAt) : null,
      scheduledFor: opening?.scheduledAt
        ? format.date(opening.scheduledAt)
        : null,
    },
    recentRequests: (data?.recentRequests ?? []).map(toRequest),
    upcomingDeadlines: (data?.upcomingDeadlines ?? []).map(toDeadline),
    selectedId,
    select: setSelectedId,
  };
}
