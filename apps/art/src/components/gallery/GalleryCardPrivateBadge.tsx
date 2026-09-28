'use client';

import { EyeOff } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';

export function GalleryCardPrivateBadge({
  viaProject,
}: {
  viaProject: boolean;
}) {
  const { t } = useTranslation('art');

  return (
    <span
      title={
        viaProject
          ? t('gallery.card.privateProjectHint')
          : t('gallery.card.privateHint')
      }
      className="pointer-events-none absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-xs transition-opacity group-focus-within:opacity-0 group-hover:opacity-0"
    >
      <EyeOff className="size-3" aria-hidden />
      {t('gallery.card.private')}
    </span>
  );
}
