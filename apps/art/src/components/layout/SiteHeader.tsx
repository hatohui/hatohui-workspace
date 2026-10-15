'use client';

import Link from 'next/link';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { GoogleLoginIconButton } from './GoogleLoginIconButton';
import { PreferencesMenu } from './PreferencesMenu';
import { SiteLogo } from './SiteLogo';
import { SiteNav } from './SiteNav';
import { WorkspaceButton } from './WorkspaceButton';
import { AccountMenu } from './AccountMenu';
import { HOME_ROUTE } from '@/constants/navigation';

export function SiteHeader() {
  const { t } = useTranslation('art');
  const { user, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[color-mix(in_oklab,var(--canvas)_94%,transparent)] backdrop-blur-xl backdrop-saturate-50 supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--canvas)_88%,transparent)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6 md:flex-nowrap md:py-3">
        <Link
          href={HOME_ROUTE}
          className="flex min-h-10 items-center gap-2 font-serif text-lg"
        >
          <SiteLogo />
          {t('site.title')}
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
        </Link>
        <SiteNav className="order-last w-full md:order-none md:w-auto" />
        <div className="flex items-center gap-1 sm:gap-2">
          <PreferencesMenu />
          {!isLoading && !user && <GoogleLoginIconButton />}
          {user && (
            <>
              {user.isArtist && <WorkspaceButton />}
              <AccountMenu user={user} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
