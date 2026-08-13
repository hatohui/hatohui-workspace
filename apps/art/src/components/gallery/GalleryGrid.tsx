'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { type AssetDto } from '@hatohui/models';
import { Button } from '@hatohui/ui';
import {
  useGalleryAssets,
  type GalleryInitialData,
} from '@/hooks/useGalleryAssets';
import { GalleryFilters } from './GalleryFilters';
import { GalleryCard } from './GalleryCard';
import { Lightbox } from './Lightbox';
import { UploadDialog } from './UploadDialog';
import { GallerySectionTabs, type GallerySection } from './GallerySectionTabs';
import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { useStaggerReveal } from '@/hooks/useStaggerReveal';

export function GalleryGrid({
  initialData,
}: {
  initialData: GalleryInitialData;
}) {
  const { t } = useTranslation('art');
  const { user } = useAuth();
  const gallery = useGalleryAssets(initialData);
  const [selected, setSelected] = useState<AssetDto | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [section, setSection] = useState<GallerySection>('assets');
  const gridRef = useStaggerReveal<HTMLDivElement>('[data-reveal]', [
    gallery.items,
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <h1 className="font-serif text-3xl">{t('gallery.title')}</h1>
          <GallerySectionTabs
            active={section}
            onChange={setSection}
            labels={{
              assets: t('gallery.title'),
              projects: t('projects.title'),
            }}
          />
        </div>
        {section === 'assets' && user?.isAdmin && (
          <Button onClick={() => setIsUploadOpen(true)}>
            {t('gallery.upload.cta')}
          </Button>
        )}
      </div>

      {section === 'projects' ? (
        <ProjectsSection />
      ) : (
        <>
          <GalleryFilters gallery={gallery} />

          {gallery.items.length === 0 && !gallery.isLoading && (
            <p className="mt-10 text-center text-muted-foreground">
              {t('gallery.empty')}
            </p>
          )}

          <div
            ref={gridRef}
            className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
          >
            {gallery.items.map((asset) => (
              <div key={asset.id} data-reveal>
                <GalleryCard
                  asset={asset}
                  isAdmin={user?.isAdmin ?? false}
                  onClick={() => setSelected(asset)}
                />
              </div>
            ))}
          </div>

          {(gallery.page > 1 || gallery.hasMore) && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={gallery.page <= 1}
                onClick={() => gallery.setPage(gallery.page - 1)}
              >
                {t('common:back')}
              </Button>
              <Button
                variant="outline"
                disabled={!gallery.hasMore}
                onClick={() => gallery.setPage(gallery.page + 1)}
              >
                {t('gallery.loadMore')}
              </Button>
            </div>
          )}
        </>
      )}

      <Lightbox asset={selected} onClose={() => setSelected(null)} />
      <UploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} />
    </main>
  );
}
