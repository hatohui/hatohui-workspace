'use client';

import Image from 'next/image';
import { useTranslation } from '@hatohui/i18n';
import type { AssetDto } from '@hatohui/models';
import { Dialog, DialogContent, DialogTitle } from '@hatohui/ui';

export function Lightbox({
  asset,
  onClose,
}: {
  asset: AssetDto | null;
  onClose: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <Dialog open={asset !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="sr-only">{asset?.filename}</DialogTitle>
        {asset && (
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-card">
              <Image
                src={asset.publicUrl}
                alt={asset.filename}
                fill
                sizes="768px"
                className="object-contain"
              />
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>
                <dt className="font-medium text-foreground">
                  {t('gallery.lightbox.filename')}
                </dt>
                <dd>{asset.filename}</dd>
              </div>
              {asset.width && asset.height && (
                <div>
                  <dt className="font-medium text-foreground">
                    {t('gallery.lightbox.dimensions')}
                  </dt>
                  <dd>
                    {asset.width}×{asset.height}
                  </dd>
                </div>
              )}
              <div>
                <dt className="font-medium text-foreground">
                  {t('gallery.lightbox.size')}
                </dt>
                <dd>{formatBytes(asset.size)}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">
                  {t('gallery.lightbox.uploaded')}
                </dt>
                <dd>{new Date(asset.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
            {asset.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {asset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
