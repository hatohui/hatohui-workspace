'use client';

import Link from 'next/link';
import { cn } from '@hatohui/ui';
import { useSiteNav } from '@/hooks/useSiteNav';

export function SiteNav({
  artist,
  className,
}: {
  artist: string;
  className?: string;
}) {
  const items = useSiteNav(artist);

  return (
    <nav
      className={cn(
        'grid grid-cols-3 gap-1 text-sm md:flex md:items-center',
        className,
      )}
    >
      {items.map(({ key, icon: Icon, href, label, isActive }) => (
        <Link
          key={key}
          href={href}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-xs transition-colors duration-200 md:min-h-9 md:flex-row md:gap-2 md:px-3 md:text-sm',
            isActive
              ? 'bg-accent font-medium text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
