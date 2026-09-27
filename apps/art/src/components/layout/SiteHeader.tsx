'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from '@hatohui/i18n';
import { useAuth, GoogleLoginIconButton } from '@hatohui/libs';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SiteNav } from './SiteNav';
import { WorkspaceButton } from './WorkspaceButton';
import { AccountMenu } from './AccountMenu';

export function SiteHeader() {
  const { t } = useTranslation('art');
  const { user, isLoading } = useAuth();
  const { artist } = useParams<{ artist?: string }>();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href={artist ? `/${artist}` : '/'} className="font-serif text-lg">
          {t('site.title')}
        </Link>
        {artist && <SiteNav artist={artist} />}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
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
