'use client';

import Link from 'next/link';
import { useTranslation } from '@hatohui/i18n';
import { useAuth, GoogleLoginIconButton } from '@hatohui/libs';
import { UserDtoRole } from '@hatohui/models';
import { Avatar } from '@hatohui/ui';
import { LanguageSwitcher } from './LanguageSwitcher';

export function SiteHeader() {
  const { t } = useTranslation('art');
  const { user, isLoading } = useAuth();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-serif text-lg">
          {t('site.title')}
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/">{t('site.nav.gallery')}</Link>
          <Link href="/commission">{t('site.nav.commission')}</Link>
          <Link href="/queue">{t('site.nav.queue')}</Link>
          {user?.role === UserDtoRole.ADMIN && (
            <Link href="/admin/commissions">{t('site.nav.admin')}</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {!isLoading && !user && <GoogleLoginIconButton />}
          {user && (
            <Avatar src={user.avatarUrl} alt={user.name} className="size-8" />
          )}
        </div>
      </div>
    </header>
  );
}
