import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, TooltipProvider, cn } from '@hatohui/ui';
import { useSidebarState } from '../../hooks/useSidebarState';
import NavItem from './NavItem';
import AccountMenu from './AccountMenu';

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.dashboard', icon: 'dashboard', end: true },
  { to: '/users', labelKey: 'nav.users', icon: 'users', end: false },
  { to: '/profiles', labelKey: 'nav.profiles', icon: 'profiles', end: false },
  {
    to: '/system-parameters',
    labelKey: 'nav.systemParameters',
    icon: 'systemParameters',
    end: false,
  },
] as const;

function Sidebar() {
  const { t } = useTranslation('workspace');
  const { width, collapsed, setWidth, toggleCollapsed } = useSidebarState();
  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (collapsed) return;
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = width;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    const handleMove = (moveEvent: PointerEvent) => {
      setWidth(startWidth + (moveEvent.clientX - startX));
    };
    const handleUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <nav
        style={{ width }}
        className="relative flex h-screen shrink-0 flex-col border-r border-border"
      >
        <div
          className={cn(
            'flex flex-1 flex-col gap-1 p-2',
            collapsed && 'items-center',
          )}
        >
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              end={item.end}
              icon={item.icon}
              label={t(item.labelKey)}
              collapsed={collapsed}
            />
          ))}
        </div>
        <AccountMenu collapsed={collapsed} />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleCollapsed}
          aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
          className="absolute top-8 -right-3 size-6 rounded-full border-border bg-card shadow-sm"
        >
          {collapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </Button>
        {!collapsed && (
          <div
            onPointerDown={startResize}
            className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize touch-none select-none hover:bg-ring"
          />
        )}
      </nav>
    </TooltipProvider>
  );
}

export default Sidebar;
