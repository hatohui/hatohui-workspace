'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, DoorOpen } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';

export interface AppNavItem {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}

export function useAppNav(): AppNavItem[] {
  const { t } = useTranslation('art');
  const { user } = useAuth();
  const pathname = usePathname();

  const items: AppNavItem[] = [
    {
      href: '/app',
      label: t('app.nav.dashboard'),
      icon: <LayoutDashboard />,
      active: pathname === '/app',
    },
  ];

  if (user?.isArtist) {
    items.push(
      {
        href: '/app/commission-settings',
        label: t('app.nav.commissionSettings'),
        icon: <Settings />,
        active: pathname?.startsWith('/app/commission-settings') ?? false,
      },
      {
        href: '/app/commission-opening',
        label: t('app.nav.commissionOpening'),
        icon: <DoorOpen />,
        active: pathname?.startsWith('/app/commission-opening') ?? false,
      },
    );
  }

  return items;
}
