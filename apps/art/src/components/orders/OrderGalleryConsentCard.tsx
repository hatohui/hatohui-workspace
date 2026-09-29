'use client';

import { Images } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Switch } from '@hatohui/ui';
import type { useClientPreferences } from '@/hooks/useClientPreferences';

export function OrderGalleryConsentCard({
  preferences,
}: {
  preferences: ReturnType<typeof useClientPreferences>;
}) {
  const { t } = useTranslation('art');

  return (
    <section className="flex items-start gap-3 rounded-xl border border-border p-5">
      <Images
        className="mt-0.5 size-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <label
        htmlFor="order-gallery-post"
        className="min-w-0 flex-1 cursor-pointer space-y-0.5"
      >
        <span className="block font-serif font-medium">
          {t('orders.settings.galleryPost')}
        </span>
        <span className="block text-sm text-muted-foreground">
          {t('orders.settings.galleryPostHint')}
        </span>
      </label>
      <Switch
        id="order-gallery-post"
        checked={preferences.allowGalleryPost}
        disabled={preferences.isSaving}
        onCheckedChange={preferences.setAllowGalleryPost}
      />
    </section>
  );
}
