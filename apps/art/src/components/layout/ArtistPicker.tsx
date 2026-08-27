'use client';

import Link from 'next/link';
import { useTranslation } from '@hatohui/i18n';
import type { PublicUserDto } from '@hatohui/models';
import { Avatar } from '@hatohui/ui';

export function ArtistPicker({ artists }: { artists: PublicUserDto[] }) {
  const { t } = useTranslation('art');

  if (artists.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-muted-foreground">{t('artistPicker.empty')}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="mb-8 text-center font-serif text-3xl">
        {t('artistPicker.title')}
      </h1>
      <ul className="space-y-2">
        {artists.map((artist) => (
          <li key={artist.id}>
            <Link
              href={`/${artist.handle}`}
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-card-hover"
            >
              <Avatar
                src={artist.avatarUrl}
                alt={artist.name}
                className="size-10"
              />
              <span className="font-medium">{artist.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
