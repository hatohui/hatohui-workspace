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
import { UploadLinkFields } from '@/components/gallery/UploadLinkFields';

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
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={form.mode === 'file' ? 'default' : 'outline'}
              onClick={() => form.setMode('file')}
            >
              {t('gallery.upload.modeFile')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={form.mode === 'link' ? 'default' : 'outline'}
              onClick={() => form.setMode('link')}
            >
              {t('gallery.upload.modeLink')}
            </Button>
          </div>

          {form.mode === 'file' ? (
            <UploadFileFields
              files={form.files}
              onFilesChange={form.setFiles}
              tagsInput={form.tagsInput}
              onTagsInputChange={form.setTagsInput}
              isUploading={form.isUploading}
            />
          ) : (
            <UploadLinkFields
              linkUrl={form.linkUrl}
              onLinkUrlChange={form.setLinkUrl}
              linkFilename={form.linkFilename}
              onLinkFilenameChange={form.setLinkFilename}
            />
          )}

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
                : t('gallery.upload.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
