'use client';

import Link from 'next/link';
import { cn } from '@hatohui/ui';
import { useSiteNav } from '@/hooks/useSiteNav';

export function SiteNav({ artist }: { artist: string }) {
  const items = useSiteNav(artist);

  return (
    <nav className="flex items-center gap-1 text-sm">
      {items.map(({ key, icon: Icon, href, label, isActive }) => (
        <Link
          key={key}
          href={href}
          aria-label={label}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors',
            isActive
              ? 'bg-secondary font-medium text-foreground'
              : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
