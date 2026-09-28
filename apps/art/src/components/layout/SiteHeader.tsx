'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from '@hatohui/i18n';
import { useAuth, GoogleLoginIconButton } from '@hatohui/libs';
import { PreferencesMenu } from './PreferencesMenu';
import { SiteNav } from './SiteNav';
import { WorkspaceButton } from './WorkspaceButton';
import { AccountMenu } from './AccountMenu';

export function SiteHeader() {
  const { t } = useTranslation('art');
  const { user, isLoading } = useAuth();
  const { artist } = useParams<{ artist?: string }>();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6 md:flex-nowrap md:py-3">
        <Link
          href={artist ? `/${artist}` : '/'}
          className="flex min-h-10 items-center font-serif text-lg"
        >
          {t('site.title')}
        </Link>
        {artist && (
          <SiteNav
            artist={artist}
            className="order-last w-full md:order-none md:w-auto"
          />
        )}
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
