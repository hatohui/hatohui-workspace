'use client';

import type { DashboardStatKey } from '@/constants/dashboard';
import { DashboardStatCard } from './DashboardStatCard';

export function DashboardStats({
  stats,
}: {
  stats: {
    key: DashboardStatKey;
    value: string;
    highlight: boolean;
    caption?: string;
    href?: string;
  }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <DashboardStatCard
          key={stat.key}
          statKey={stat.key}
          value={stat.value}
          highlight={stat.highlight}
          caption={stat.caption}
          href={stat.href}
        />
      ))}
    </div>
  );
}
