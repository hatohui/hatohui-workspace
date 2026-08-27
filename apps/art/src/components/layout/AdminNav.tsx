'use client';

import Link from 'next/link';
import { useTranslation } from '@hatohui/i18n';

export function AdminNav() {
  const { t } = useTranslation('art');

  return (
    <nav className="mb-6 flex gap-4 border-b border-border pb-4 text-sm">
      <Link href="/admin/commissions">{t('commission.admin.title')}</Link>
      <Link href="/admin/commissions/production">
        {t('commission.admin.production.title')}
      </Link>
      <Link href="/admin/assets">{t('gallery.title')}</Link>
      <Link href="/admin/projects">{t('projects.title')}</Link>
      <Link href="/admin/groups">{t('commission.groupsAdmin.title')}</Link>
      <Link href="/admin/pricing">{t('commission.admin.pricing.title')}</Link>
    </nav>
  );
}
