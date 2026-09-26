'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import type { useArtPicker } from '@/hooks/useArtPicker';

export function ArtPickerGrid({
  picker,
}: {
  picker: ReturnType<typeof useArtPicker>;
}) {
  const { t } = useTranslation('art');

  if (!picker.isLoading && picker.items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t('projects.picker.emptyGallery')}
      </p>
    );
  }

  return (
    <div className="grid max-h-[55vh] grid-cols-3 gap-2 overflow-y-auto p-1 sm:grid-cols-4">
      {picker.items.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={item.isInProject}
          aria-pressed={item.isSelected}
          onClick={() => picker.toggle(item.id)}
          className={cn(
            'relative aspect-square cursor-pointer overflow-hidden rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-default',
            item.isSelected && 'ring-2 ring-primary',
          )}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="25vw"
            className={cn('object-cover', item.isInProject && 'opacity-40')}
          />
          {item.isSelected && (
            <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-3.5" aria-hidden />
            </span>
          )}
          {item.isInProject && (
            <span className="absolute inset-x-0 bottom-0 bg-background/90 py-0.5 text-center text-xs">
              {t('projects.picker.alreadyIn')}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
