'use client';

import { cn } from '@hatohui/ui';

export type GallerySection = 'assets' | 'projects';

export function GallerySectionTabs({
  active,
  onChange,
  labels,
}: {
  active: GallerySection;
  onChange: (section: GallerySection) => void;
  labels: Record<GallerySection, string>;
}) {
  const sections: GallerySection[] = ['assets', 'projects'];

  return (
    <div className="flex gap-1 rounded-md bg-secondary p-1 text-sm">
      {sections.map((section) => (
        <button
          key={section}
          type="button"
          onClick={() => onChange(section)}
          className={cn(
            'rounded-md px-3 py-1.5 font-medium transition-colors',
            active === section
              ? 'bg-card text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {labels[section]}
        </button>
      ))}
    </div>
  );
}
