'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@hatohui/i18n';
import { SITE_NAV_ITEMS, type SiteNavItem } from '@/constants/navigation';

function matchesSegment(pathname: string, segment: string): boolean {
  return pathname === segment || pathname.startsWith(`${segment}/`);
}

export function useSiteNav() {
  const { t } = useTranslation('art');
  const pathname = usePathname();
  const [pending, setPending] = useState<{
    key: SiteNavItem['key'];
    from: string;
  } | null>(null);
  const pendingKey = pending?.from === pathname ? pending.key : null;

  return SITE_NAV_ITEMS.map((item) => {
    const isCurrent = item.activeSegments.some((segment) =>
      matchesSegment(pathname, segment),
    );

    return {
      key: item.key,
      icon: item.icon,
      href: item.segment,
      label: t(`site.nav.${item.key}`),
      isActive: pendingKey ? pendingKey === item.key : isCurrent,
      isPending: pendingKey === item.key,
      onNavigate: () => setPending({ key: item.key, from: pathname }),
    };
  });
}
