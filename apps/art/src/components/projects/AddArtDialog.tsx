'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@hatohui/ui';
import { useArtPicker } from '@/hooks/useArtPicker';
import { ImageDropzone } from '@/components/shared/ImageDropzone';
import { ArtPickerGrid } from './ArtPickerGrid';

export function AddArtDialog({
  projectId,
  existingAssetIds,
  open,
  onOpenChange,
}: {
  projectId: string;
  existingAssetIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation('art');
  const picker = useArtPicker(projectId, existingAssetIds, () =>
    onOpenChange(false),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('projects.picker.title')}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="gallery" className="gap-4">
          <TabsList>
            <TabsTrigger value="gallery">
              {t('projects.picker.fromGallery')}
            </TabsTrigger>
            <TabsTrigger value="upload">
              {t('projects.picker.uploadNew')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="gallery" className="space-y-4">
            <ArtPickerGrid picker={picker} />
            <div className="flex justify-end">
              <Button
                disabled={picker.selectedCount === 0}
                onClick={picker.addSelected}
              >
                {t('projects.picker.addSelected', {
                  count: picker.selectedCount,
                })}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="upload" className="space-y-3">
            <ImageDropzone
              disabled={picker.isUploading}
              hint={t('projects.picker.uploadHint')}
              onFilesSelected={(files) => void picker.uploadAndAdd(files)}
            />
            {picker.isUploading && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner className="size-4" />
                {t('projects.picker.uploading')}
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
