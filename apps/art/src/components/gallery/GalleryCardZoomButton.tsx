'use client';

import { Maximize2 } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

export function GalleryCardZoomButton({ onZoom }: { onZoom: () => void }) {
  const { t } = useTranslation('art');

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-sm"
      aria-label={t('gallery.viewLarge')}
      title={t('gallery.viewLarge')}
      className="absolute top-2 left-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
      onClick={onZoom}
    >
      <Maximize2 />
    </Button>
  );
}
