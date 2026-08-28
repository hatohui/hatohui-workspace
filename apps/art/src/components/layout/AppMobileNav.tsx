'use client';

import Link from 'next/link';
import { cn } from '@hatohui/ui';
import { useAppNav } from '@/hooks/useAppNav';

export function AppMobileNav() {
  const navItems = useAppNav();

  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-border pb-2 md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150 ease-out motion-reduce:transition-none [&_svg]:size-4',
            item.active
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/50',
          )}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
