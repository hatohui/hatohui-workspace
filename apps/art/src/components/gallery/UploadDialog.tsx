'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@hatohui/ui';
import { useUploadDialogForm } from '@/hooks/useUploadDialogForm';
import { UploadFileFields } from '@/components/gallery/UploadFileFields';

export function UploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation('art');
  const form = useUploadDialogForm(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('gallery.upload.cta')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <UploadFileFields
            queue={form.queue}
            tags={form.tags}
            onTagsChange={form.setTags}
            failedCount={form.failedCount}
            isUploading={form.isUploading}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('gallery.upload.cancel')}
            </Button>
            <Button
              disabled={!form.canSave || form.isUploading}
              onClick={() => void form.save()}
            >
              {form.isUploading
                ? t('gallery.upload.uploading')
                : form.failedCount > 0
                  ? t('gallery.upload.retryCount', { count: form.failedCount })
                  : form.queue.items.length > 1
                    ? t('gallery.upload.saveCount', {
                        count: form.queue.items.length,
                      })
                    : t('gallery.upload.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
