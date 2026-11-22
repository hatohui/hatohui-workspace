import { useRef } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type {
  TravelActivityDto,
  TravelParticipantMemberDto,
} from '@hatohui/models';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@hatohui/ui';
import { ImagePlus, Trash2 } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES } from '../../constants/travel';
import type { useTravelGallery } from '../../hooks/useTravelGallery';
import PlanGallerySkeleton from './PlanGallerySkeleton';

interface PlanGalleryTabProps {
  gallery: ReturnType<typeof useTravelGallery>;
  activities: TravelActivityDto[];
  participants: TravelParticipantMemberDto[];
  isMember: boolean;
  isOwner: boolean;
  viewerId?: string;
}

function PlanGalleryTab({
  gallery,
  activities,
  participants,
  isMember,
  isOwner,
  viewerId,
}: PlanGalleryTabProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={gallery.activityId}
            onChange={(e) => gallery.setActivityId(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs"
          >
            <option value="">{t('plans.gallery.allActivities')}</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            value={gallery.uploadedById}
            onChange={(e) => gallery.setUploadedById(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs"
          >
            <option value="">{t('plans.gallery.allMembers')}</option>
            {participants.map((p) => (
              <option key={p.userId} value={p.userId}>
                {p.displayName}
              </option>
            ))}
          </select>
        </div>

        {isMember && (
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED_IMAGE_TYPES}
              className="hidden"
              onChange={(e) => {
                void gallery.uploadFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <Button
              size="sm"
              disabled={gallery.isUploading}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="size-4" aria-hidden />
              {gallery.isUploading
                ? t('plans.gallery.uploading')
                : t('plans.gallery.upload')}
            </Button>
          </>
        )}
      </div>

      {gallery.isLoading ? (
        <PlanGallerySkeleton />
      ) : gallery.items.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {t('plans.gallery.empty')}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {gallery.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => gallery.setActivePhoto(item)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
            >
              <img
                src={item.thumbnailUrl}
                alt={item.caption ?? item.activityName ?? ''}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {item.activityName && (
                <span className="absolute right-2 bottom-2 left-2 truncate rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
                  {item.activityName}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {gallery.activePhoto && (
        <Dialog
          open
          onOpenChange={(open) => !open && gallery.setActivePhoto(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {gallery.activePhoto.activityName ??
                  t('plans.gallery.groupPhotos')}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-hidden rounded-lg bg-black/90">
              <img
                src={gallery.activePhoto.previewUrl}
                alt={gallery.activePhoto.caption ?? ''}
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-2 pt-2">
              <span className="text-xs text-muted-foreground">
                {gallery.activePhoto.caption}
              </span>
              <div className="flex items-center gap-2">
                {(isOwner || gallery.activePhoto.uploadedById === viewerId) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      gallery.activePhoto &&
                      void gallery.removePhoto(gallery.activePhoto)
                    }
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    {t('recommendation.delete')}
                  </Button>
                )}
                <Button size="sm" onClick={() => gallery.setActivePhoto(null)}>
                  {t('plans.gallery.close')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default PlanGalleryTab;
