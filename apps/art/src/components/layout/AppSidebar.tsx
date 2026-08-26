'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavItem,
  SidebarToggle,
} from '@hatohui/ui';

export function AppSidebar() {
  const { t } = useTranslation('art');
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <Sidebar defaultCollapsed={false}>
      <SidebarHeader>
        <SidebarToggle
          labelExpand={t('app.nav.toggle')}
          labelCollapse={t('app.nav.toggle')}
          iconExpand={<PanelLeftOpen className="size-5" />}
          iconCollapse={<PanelLeftClose className="size-5" />}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavItem
          as={Link}
          href="/app"
          active={pathname === '/app'}
          icon={<LayoutDashboard />}
        >
          {t('app.nav.dashboard')}
        </SidebarNavItem>
        {user?.isArtist && (
          <SidebarNavItem
            as={Link}
            href="/app/commission-settings"
            active={pathname?.startsWith('/app/commission-settings')}
            icon={<Settings />}
          >
            {t('app.nav.commissionSettings')}
          </SidebarNavItem>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarNavItem as={Link} href="/" icon={<ArrowLeft />}>
          {t('app.nav.backToSite')}
        </SidebarNavItem>
      </SidebarFooter>
    </Sidebar>
  );
}
