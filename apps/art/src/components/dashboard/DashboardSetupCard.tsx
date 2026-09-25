'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { SETUP_ROUTE } from '@/constants/setup';

export function DashboardSetupCard({
  progress,
}: {
  progress: { done: number; total: number };
}) {
  const { t } = useTranslation('art');

  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border px-5 py-4">
      <p className="flex items-center gap-3">
        <Sparkles className="size-5 shrink-0 text-primary" aria-hidden />
        <span>
          <span className="block font-medium">
            {t('app.dashboard.setup.title')}
          </span>
          <span className="block text-sm text-muted-foreground">
            {t('app.dashboard.setup.progress', progress)}
          </span>
        </span>
      </p>
      <Button asChild size="sm" variant="outline">
        <Link href={SETUP_ROUTE}>{t('app.dashboard.setup.cta')}</Link>
      </Button>
    </section>
  );
}
