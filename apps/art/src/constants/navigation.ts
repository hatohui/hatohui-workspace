import { Images, ListOrdered, Palette, type LucideIcon } from 'lucide-react';

export const TAB_SEARCH_PARAM = 'tab';

export const WORKSPACE_HOME_ROUTE = '/app';

export const artistFaqPath = (artist: string) => `/${artist}/faq`;

export interface SiteNavItem {
  key: 'gallery' | 'commission' | 'queue';
  segment: string;
  activeSegments: string[];
  icon: LucideIcon;
}

export const SITE_NAV_ITEMS: SiteNavItem[] = [
  {
    key: 'gallery',
    segment: '',
    activeSegments: ['', '/gallery', '/projects'],
    icon: Images,
  },
  {
    key: 'commission',
    segment: '/commission',
    activeSegments: ['/commission'],
    icon: Palette,
  },
  {
    key: 'queue',
    segment: '/queue',
    activeSegments: ['/queue', '/groups'],
    icon: ListOrdered,
  },
];
