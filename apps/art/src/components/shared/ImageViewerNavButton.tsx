'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, cn } from '@hatohui/ui';

export function ImageViewerNavButton({
  direction,
  onClick,
}: {
  direction: 'previous' | 'next';
  onClick: () => void;
}) {
  const { t } = useTranslation('art');
  const label = t(`imageViewer.${direction}`);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      className={cn(
        'absolute top-1/2 size-11 -translate-y-1/2 rounded-full border border-white/25 bg-black/60 text-white backdrop-blur hover:bg-white/15 hover:text-white',
        direction === 'previous' ? 'left-3 sm:left-4' : 'right-3 sm:right-4',
      )}
      onClick={onClick}
    >
      {direction === 'previous' ? <ChevronLeft /> : <ChevronRight />}
    </Button>
  );
}
