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
import { UploadDialog } from './UploadDialog';
import { GallerySectionTabs, type GallerySection } from './GallerySectionTabs';
import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { AddToProjectDialog } from '@/components/projects/AddToProjectDialog';
import { useStaggerReveal } from '@/hooks/useStaggerReveal';
import { GALLERY_ROW_HEIGHT_CLASS } from '@/constants/gallery';

export function GalleryGrid({
  artistId,
  initialData,
  galleryBasePath,
  projectBasePath,
}: {
  artistId?: string;
  initialData: GalleryInitialData;
  galleryBasePath: string;
  projectBasePath: string;
}) {
  const { t } = useTranslation('art');
  const { user } = useAuth();
  const gallery = useGalleryAssets(artistId, initialData);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [projectTarget, setProjectTarget] = useState<AssetDto | null>(null);
  const [section, setSection] = useState<GallerySection>('assets');
  const gridRef = useStaggerReveal<HTMLDivElement>('[data-reveal]', [
    gallery.items,
  ]);
  const isOwner = artistId ? user?.id === artistId : (user?.isAdmin ?? false);

  return (
    <div>
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
        {section === 'assets' && isOwner && (
          <Button onClick={() => setIsUploadOpen(true)}>
            {t('gallery.upload.cta')}
          </Button>
        )}
      </div>

      {section === 'projects' ? (
        <ProjectsSection
          artistId={artistId}
          basePath={projectBasePath}
          showHidden={isOwner}
        />
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
            className={`mt-6 flex flex-wrap gap-2 after:grow-[999999] after:content-[''] sm:gap-3 ${GALLERY_ROW_HEIGHT_CLASS}`}
          >
            {gallery.items.map((asset) => (
              <GalleryCard
                key={asset.id}
                asset={asset}
                isAdmin={isOwner}
                href={`${galleryBasePath}/${asset.id}`}
                onAddToProject={() => setProjectTarget(asset)}
              />
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

      <UploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} />
      <AddToProjectDialog
        asset={projectTarget}
        onClose={() => setProjectTarget(null)}
      />
    </div>
  );
}
