'use client';

import { Check } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';

export function GalleryCardSelectToggle({
  filename,
  selected,
  onToggle,
}: {
  filename: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={t('gallery.selection.toggle', { name: filename })}
      onClick={onToggle}
      className={`absolute inset-0 cursor-pointer transition-shadow outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 ${
        selected ? 'bg-primary/20 ring-[3px] ring-primary ring-inset' : ''
      }`}
    >
      <span
        className={`absolute top-2 left-2 grid size-6 place-content-center rounded-full border-2 shadow-sm ${
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-white bg-black/30'
        }`}
      >
        {selected && <Check className="size-4" />}
      </span>
    </button>
  );
}
