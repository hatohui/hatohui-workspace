'use client';

import { usePathname } from 'next/navigation';
import { useTranslation } from '@hatohui/i18n';
import { SITE_NAV_ITEMS } from '@/constants/navigation';

function matchesSegment(rest: string, segment: string): boolean {
  if (segment === '') return rest === '';
  return rest === segment || rest.startsWith(`${segment}/`);
}

export function useSiteNav(artist: string) {
  const { t } = useTranslation('art');
  const pathname = usePathname();
  const base = `/${artist}`;
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : null;

  return SITE_NAV_ITEMS.map((item) => ({
    key: item.key,
    icon: item.icon,
    href: `${base}${item.segment}`,
    label: t(`site.nav.${item.key}`),
    isActive:
      rest !== null &&
      item.activeSegments.some((segment) => matchesSegment(rest, segment)),
  }));
}
