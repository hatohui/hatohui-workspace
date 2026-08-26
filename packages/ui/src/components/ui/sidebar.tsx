'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined,
);

function useSidebarContext(): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('Sidebar.* must be used within a <Sidebar>');
  }
  return context;
}

export function Sidebar({
  collapsed,
  onCollapsedChange,
  defaultCollapsed = false,
  className,
  children,
}: {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  defaultCollapsed?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [internalCollapsed, setInternalCollapsed] =
    React.useState(defaultCollapsed);
  const isControlled = collapsed !== undefined;
  const isCollapsed = isControlled ? collapsed : internalCollapsed;

  const toggle = React.useCallback(() => {
    const next = !isCollapsed;
    if (!isControlled) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }, [isCollapsed, isControlled, onCollapsedChange]);

  const value = React.useMemo(
    () => ({ collapsed: isCollapsed, toggle }),
    [isCollapsed, toggle],
  );

  return (
    <SidebarContext.Provider value={value}>
      <aside
        data-collapsed={isCollapsed}
        className={cn(
          'flex h-full shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64',
          className,
        )}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
}

export function SidebarHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex h-14 shrink-0 items-center gap-2 border-b border-border px-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SidebarContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col gap-1 overflow-y-auto p-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SidebarFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('shrink-0 border-t border-border p-2', className)}>
      {children}
    </div>
  );
}

export function SidebarToggle({
  className,
  labelExpand,
  labelCollapse,
  iconExpand,
  iconCollapse,
}: {
  className?: string;
  labelExpand: string;
  labelCollapse: string;
  iconExpand: React.ReactNode;
  iconCollapse: React.ReactNode;
}) {
  const { collapsed, toggle } = useSidebarContext();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={collapsed ? labelExpand : labelCollapse}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
        className,
      )}
    >
      {collapsed ? iconExpand : iconCollapse}
    </button>
  );
}

export function SidebarNavItem({
  href,
  active,
  icon,
  children,
  className,
  as: Component = 'a',
}: {
  href: string;
  active?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType<{ href: string; className?: string }>;
}) {
  const { collapsed } = useSidebarContext();
  return (
    <Component
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        collapsed && 'justify-center px-0',
        className,
      )}
    >
      <span className="shrink-0 [&_svg]:size-5">{icon}</span>
      <span
        className={cn(
          'truncate transition-[opacity,width] duration-150',
          collapsed && 'sr-only',
        )}
      >
        {children}
      </span>
    </Component>
  );
}

export { useSidebarContext };
