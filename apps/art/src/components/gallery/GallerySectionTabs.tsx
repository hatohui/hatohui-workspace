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
    <div className="flex gap-0.5 rounded-md bg-secondary p-0.5 text-sm">
      {sections.map((section) => (
        <button
          key={section}
          type="button"
          aria-pressed={active === section}
          onClick={() => onChange(section)}
          className={cn(
            'min-h-8 rounded-md px-3 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            active === section
              ? 'bg-primary text-primary-foreground shadow-soft'
              : 'text-muted-foreground hover:text-accent-foreground',
          )}
        >
          {labels[section]}
        </button>
      ))}
    </div>
  );
}
