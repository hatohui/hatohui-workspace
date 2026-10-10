'use client';

import { usePathname } from 'next/navigation';
import { useTranslation } from '@hatohui/i18n';
import { SITE_NAV_ITEMS } from '@/constants/navigation';

function matchesSegment(pathname: string, segment: string): boolean {
  return pathname === segment || pathname.startsWith(`${segment}/`);
}

export function useSiteNav() {
  const { t } = useTranslation('art');
  const pathname = usePathname();

  return SITE_NAV_ITEMS.map((item) => ({
    key: item.key,
    icon: item.icon,
    href: item.segment,
    label: t(`site.nav.${item.key}`),
    isActive: item.activeSegments.some((segment) =>
      matchesSegment(pathname, segment),
    ),
  }));
}
