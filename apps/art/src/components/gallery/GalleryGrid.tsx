'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import { type AssetDto } from '@hatohui/models';
import {
  useGalleryAssets,
  type GalleryInitialData,
} from '@/hooks/useGalleryAssets';
import { GalleryFilters } from './GalleryFilters';
import { GalleryLoadMore } from './GalleryLoadMore';
import { GalleryCard } from './GalleryCard';
import { JustifiedRows } from '@/components/shared/JustifiedRows';
import { UploadDialog } from './UploadDialog';
import { GalleryOwnerActions } from './GalleryOwnerActions';
import { GallerySelectionBar } from './GallerySelectionBar';
import { GalleryDeleteConfirm } from './GalleryDeleteConfirm';
import { AssetEditDialog } from './AssetEditDialog';
import { useGallerySelection } from '@/hooks/useGallerySelection';
import { GallerySectionTabs, type GallerySection } from './GallerySectionTabs';
import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { AddToProjectDialog } from '@/components/projects/AddToProjectDialog';
import { useStaggerReveal } from '@/hooks/useStaggerReveal';
import { useImageViewer } from '@/hooks/useImageViewer';
import { ImageViewer } from '@/components/shared/ImageViewer';
import { GALLERY_ROW_HEIGHT_CLASS } from '@/constants/gallery';

export function GalleryGrid({
  artistId,
  initialData,
  galleryBasePath,
  projectBasePath,
  initialSection = 'assets',
}: {
  artistId?: string;
  initialData: GalleryInitialData;
  galleryBasePath: string;
  projectBasePath: string;
  initialSection?: GallerySection;
}) {
  const { t } = useTranslation('art');
  const { user } = useAuth();
  const gallery = useGalleryAssets(artistId, initialData);
  const selection = useGallerySelection(gallery.items);
  const viewer = useImageViewer();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [projectTarget, setProjectTarget] = useState<AssetDto | null>(null);
  const [editTarget, setEditTarget] = useState<AssetDto | null>(null);
  const [section, setSection] = useState<GallerySection>(initialSection);
  const gridRef = useStaggerReveal<HTMLDivElement>('[data-reveal]', [
    gallery.itemsKey,
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
          <GalleryOwnerActions
            canSelect={gallery.items.length > 0}
            isSelecting={selection.isSelecting}
            onSelect={selection.start}
            onUpload={() => setIsUploadOpen(true)}
          />
        )}
      </div>

      {section === 'projects' ? (
        <ProjectsSection
          artistId={artistId}
          basePath={projectBasePath}
          showPrivate={isOwner}
        />
      ) : (
        <>
          <GalleryFilters gallery={gallery} canHidePrivate={isOwner} />

          {gallery.items.length === 0 && !gallery.isLoading && (
            <p className="mt-10 text-center text-muted-foreground">
              {t('gallery.empty')}
            </p>
          )}

          <div ref={gridRef} className="mt-6">
            <JustifiedRows
              items={gallery.items}
              getKey={(asset) => asset.id}
              className={`gap-2 sm:gap-3 ${GALLERY_ROW_HEIGHT_CLASS}`}
              renderItem={(asset) => (
                <GalleryCard
                  key={asset.id}
                  asset={asset}
                  isAdmin={isOwner}
                  href={`${galleryBasePath}/${asset.id}`}
                  onAddToProject={() => setProjectTarget(asset)}
                  onEdit={() => setEditTarget(asset)}
                  onZoom={() =>
                    viewer.open(asset.publicUrl, {
                      title: asset.title,
                      description: asset.description,
                    })
                  }
                  selection={
                    selection.isSelecting
                      ? {
                          selected: selection.isSelected(asset.id),
                          onToggle: () => selection.toggle(asset.id),
                        }
                      : undefined
                  }
                />
              )}
            />
          </div>

          <GalleryLoadMore
            hasMore={gallery.hasMore}
            isFetchingMore={gallery.isFetchingMore}
            onLoadMore={gallery.loadMore}
          />

          {selection.isSelecting && (
            <GallerySelectionBar selection={selection} />
          )}
        </>
      )}

      <GalleryDeleteConfirm selection={selection} />
      <AssetEditDialog asset={editTarget} onClose={() => setEditTarget(null)} />
      <ImageViewer
        src={viewer.src}
        alt={viewer.caption.title ?? t('gallery.title')}
        caption={viewer.caption}
        onClose={viewer.close}
      />
      <UploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} />
      <AddToProjectDialog
        asset={projectTarget}
        onClose={() => setProjectTarget(null)}
      />
    </div>
  );
}
