'use client';

import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { WORKSPACE_HOME_ROUTE } from '@/constants/navigation';

export function WorkspaceButton() {
  const { t } = useTranslation('art');
  const label = t('site.nav.workspace');

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={WORKSPACE_HOME_ROUTE} aria-label={label}>
        <LayoutGrid aria-hidden />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    </Button>
  );
}
