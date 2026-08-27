'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import {
  useAuth,
  GoogleLoginIconButton,
  useConfirmLogout,
} from '@hatohui/libs';
import {
  Avatar,
  Button,
  ConfirmDialog,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@hatohui/ui';
import { LanguageSwitcher } from './LanguageSwitcher';

export function SiteHeader() {
  const { t } = useTranslation(['art', 'common']);
  const { user, isLoading } = useAuth();
  const { confirming, requestLogout, cancelLogout, confirmLogout } =
    useConfirmLogout();
  const { artist } = useParams<{ artist?: string }>();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href={artist ? `/${artist}` : '/'} className="font-serif text-lg">
          {t('site.title')}
        </Link>
        {artist && (
          <nav className="flex items-center gap-6 text-sm">
            <Link href={`/${artist}`}>{t('site.nav.gallery')}</Link>
            <Link href={`/${artist}/commission`}>
              {t('site.nav.commission')}
            </Link>
            <Link href={`/${artist}/queue`}>{t('site.nav.queue')}</Link>
            {user?.isAdmin && (
              <Link href="/admin/commissions">{t('site.nav.admin')}</Link>
            )}
          </nav>
        )}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {!isLoading && !user && <GoogleLoginIconButton />}
          {user && (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/app" aria-label={t('app.nav.openLabel')}>
                  <LayoutGrid />
                </Link>
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label={t('common:auth.loggedInAs', {
                      name: user.name,
                    })}
                  >
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.name}
                      className="size-8"
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-2">
                  <p className="px-2 py-1.5 text-sm text-muted-foreground">
                    {t('common:auth.loggedInAs', { name: user.name })}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={requestLogout}
                  >
                    {t('common:auth.logout')}
                  </Button>
                </PopoverContent>
              </Popover>
              <ConfirmDialog
                open={confirming}
                title={t('common:auth.logoutConfirmTitle')}
                description={t('common:auth.logoutConfirmDescription')}
                cancelLabel={t('common:auth.logoutConfirmCancel')}
                confirmLabel={t('common:auth.logoutConfirmSubmit')}
                onCancel={cancelLogout}
                onConfirm={() => void confirmLogout()}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
