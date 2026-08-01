'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { MultiImageUploadField } from '@/components/shared/MultiImageUploadField';

export function CommissionDeliverPanel({
  deliverableAssets,
  onDeliver,
  isDelivering,
}: {
  deliverableAssets: string[];
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
      {deliverableAssets.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {deliverableAssets.map((url) => (
            <img
              key={url}
              src={url}
              alt=""
              className="aspect-square w-full rounded object-cover"
            />
          ))}
        </div>
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
