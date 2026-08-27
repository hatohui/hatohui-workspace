'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { MultiImageUploadField } from '@/components/shared/MultiImageUploadField';

export function CommissionDeliverPanel({
  deliveredAt,
  onDeliver,
  isDelivering,
}: {
  deliveredAt: string | null;
  onDeliver: (files: File[]) => Promise<unknown>;
  isDelivering: boolean;
}) {
  const { t } = useTranslation('art');
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="rounded-lg border border-border p-4">
      <h2 className="mb-2 text-sm font-medium">
        {t('commission.admin.deliver.title')}
      </h2>
      {deliveredAt && (
        <p className="mb-3 text-sm text-muted-foreground">
          {t('commission.admin.deliver.deliveredAt', {
            date: new Date(deliveredAt).toLocaleDateString(),
          })}
        </p>
      )}
      <MultiImageUploadField
        label={t('commission.admin.deliver.filesLabel')}
        files={files}
        onChange={setFiles}
        isUploading={isDelivering}
      />
      <Button
        size="sm"
        className="mt-2"
        disabled={files.length === 0 || isDelivering}
        onClick={() => {
          void onDeliver(files).then(() => setFiles([]));
        }}
      >
        {t('commission.admin.deliver.send')}
      </Button>
    </div>
  );
}
