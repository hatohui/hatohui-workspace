'use client';

import Link from 'next/link';
import { PanelLeftClose, PanelLeftOpen, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavItem,
  SidebarToggle,
} from '@hatohui/ui';
import { useAppNav } from '@/hooks/useAppNav';
import { HOME_ROUTE } from '@/constants/navigation';

export function AppSidebar() {
  const { t } = useTranslation('art');
  const navItems = useAppNav();

  return (
    <Sidebar defaultCollapsed={false} className="hidden md:flex">
      <SidebarHeader>
        <SidebarToggle
          labelExpand={t('app.nav.toggle')}
          labelCollapse={t('app.nav.toggle')}
          iconExpand={<PanelLeftOpen className="size-5" />}
          iconCollapse={<PanelLeftClose className="size-5" />}
        />
      </SidebarHeader>
      <SidebarContent>
        {navItems
          .filter((item) => item.placement === 'main')
          .map((item) => (
            <SidebarNavItem
              key={item.href}
              as={Link}
              href={item.href}
              active={item.active}
              icon={item.icon}
            >
              {item.label}
            </SidebarNavItem>
          ))}
      </SidebarContent>
      <SidebarFooter>
        {navItems
          .filter((item) => item.placement === 'footer')
          .map((item) => (
            <SidebarNavItem
              key={item.href}
              as={Link}
              href={item.href}
              active={item.active}
              icon={item.icon}
            >
              {item.label}
            </SidebarNavItem>
          ))}
        <SidebarNavItem as={Link} href={HOME_ROUTE} icon={<ArrowLeft />}>
          {t('app.nav.backToSite')}
        </SidebarNavItem>
      </SidebarFooter>
    </Sidebar>
  );
}
