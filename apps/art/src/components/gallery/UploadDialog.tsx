'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@hatohui/ui';
import { useAssetUpload } from '@/hooks/useAssetUpload';
import { MultiImageUploadField } from '@/components/shared/MultiImageUploadField';

export function UploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation('art');
  const { uploadAsset, isUploading } = useAssetUpload();
  const [files, setFiles] = useState<File[]>([]);
  const [tagsInput, setTagsInput] = useState('');

  const handleSave = async () => {
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    for (const file of files) {
      await uploadAsset(file, tags);
    }
    setFiles([]);
    setTagsInput('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('gallery.upload.cta')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <MultiImageUploadField
            label={t('gallery.upload.cta')}
            files={files}
            onChange={setFiles}
            isUploading={isUploading}
          />

          <div>
            <Label htmlFor="tags">{t('gallery.upload.tagsLabel')}</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('gallery.upload.tagsHint')}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('gallery.upload.cancel')}
            </Button>
            <Button
              disabled={files.length === 0 || isUploading}
              onClick={() => void handleSave()}
            >
              {isUploading
                ? t('gallery.upload.uploading')
                : t('gallery.upload.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
