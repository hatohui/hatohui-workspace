import { Images, ListOrdered, Palette, type LucideIcon } from 'lucide-react';

export const TAB_SEARCH_PARAM = 'tab';

export const WORKSPACE_HOME_ROUTE = '/app';

export const HOME_ROUTE = '/';
export const GALLERY_ROUTE = '/gallery';
export const PROJECTS_ROUTE = '/projects';
export const COMMISSION_ROUTE = '/commission';
export const FAQ_ROUTE = '/faq';
export const GROUPS_ROUTE = '/groups';

export interface SiteNavItem {
  key: 'gallery' | 'commission' | 'queue';
  segment: string;
  activeSegments: string[];
  icon: LucideIcon;
}

export const SITE_NAV_ITEMS: SiteNavItem[] = [
  {
    key: 'gallery',
    segment: '/gallery',
    activeSegments: ['/gallery', '/projects'],
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
