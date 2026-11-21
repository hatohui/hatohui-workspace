'use client';

import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';

export function ArtworkProcessFrame({
  src,
  label,
  isFinal,
  onOpen,
}: {
  src: string;
  label: string;
  isFinal: boolean;
  onOpen: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex cursor-zoom-in flex-col items-center gap-1.5 focus-visible:outline-none"
    >
      <span
        className={cn(
          'artwork-frame relative block h-32 overflow-hidden rounded-lg bg-card group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50 sm:h-40',
          isFinal && 'ring-2 ring-primary',
        )}
      >
        <img
          src={src}
          alt={t('gallery.process.stepAlt', { label })}
          loading="lazy"
          className="h-full w-auto max-w-none object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </span>
      <span
        className={cn(
          'text-xs',
          isFinal ? 'font-medium text-primary' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
    </button>
  );
}
