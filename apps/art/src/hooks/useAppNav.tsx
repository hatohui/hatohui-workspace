'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  DoorOpen,
  FolderKanban,
  Images,
  Inbox,
  LayoutDashboard,
  Settings,
  UsersRound,
} from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';

export interface AppNavItem {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  placement: 'main' | 'footer';
}

export function useAppNav(): AppNavItem[] {
  const { t } = useTranslation('art');
  const { user } = useAuth();
  const pathname = usePathname() ?? '';

  const item = (
    href: string,
    labelKey: string,
    icon: ReactNode,
    placement: AppNavItem['placement'] = 'main',
  ): AppNavItem => ({
    href,
    label: t(`app.nav.${labelKey}`),
    icon,
    placement,
    active: href === '/app' ? pathname === href : pathname.startsWith(href),
  });

  const home = item('/app', 'dashboard', <LayoutDashboard />);
  if (!user?.isArtist) return [home];

  return [
    home,
    item('/app/commissions', 'commissions', <Inbox />),
    item('/app/commission-opening', 'commissionOpening', <DoorOpen />),
    item('/app/gallery', 'gallery', <Images />),
    item('/app/projects', 'projects', <FolderKanban />),
    item('/app/groups', 'groups', <UsersRound />),
    item('/app/configure', 'configure', <Settings />, 'footer'),
  ];
}
