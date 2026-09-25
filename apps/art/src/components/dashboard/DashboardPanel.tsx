'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { ArrowRight } from 'lucide-react';

export function DashboardPanel({
  title,
  href,
  empty,
  className,
  children,
}: {
  title: string;
  href?: string;
  empty: string | null;
  className?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation('art');

  return (
    <section
      className={cn('rounded-xl border border-border bg-background', className)}
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h2 className="font-medium">{title}</h2>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            {t('app.dashboard.viewAll')}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
      {empty ? (
        <p className="px-5 pt-6 pb-8 text-center text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <ul className="divide-y divide-border px-2 pb-2">{children}</ul>
      )}
    </section>
  );
}
