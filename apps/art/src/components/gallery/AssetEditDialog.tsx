'use client';

import { useTranslation } from '@hatohui/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@hatohui/ui';
import type { AssetDto } from '@hatohui/models';
import { AssetEditForm } from './AssetEditForm';

export function AssetEditDialog({
  asset,
  onClose,
}: {
  asset: AssetDto | null;
  onClose: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <Dialog open={asset !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t('gallery.details.editTitle')}</DialogTitle>
        </DialogHeader>
        {asset && (
          <AssetEditForm key={asset.id} asset={asset} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
