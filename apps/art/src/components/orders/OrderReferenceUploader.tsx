'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { MultiImageUploadField } from '@/components/shared/MultiImageUploadField';

export function OrderReferenceUploader({
  references,
  onAdd,
  isUploading,
}: {
  references: string[];
  onAdd: (files: File[]) => Promise<unknown>;
  isUploading: boolean;
}) {
  const { t } = useTranslation('art');
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div>
      {references.length > 0 && (
        <div className="mb-3">
          <h2 className="mb-2 font-medium">{t('orders.existingReferences')}</h2>
          <div className="grid grid-cols-3 gap-2">
            {references.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="aspect-square w-full rounded object-cover"
              />
            ))}
          </div>
        </div>
      )}
      <MultiImageUploadField
        label={t('commission.form.attachmentsLabel')}
        files={files}
        onChange={setFiles}
        isUploading={isUploading}
      />
      <Button
        size="sm"
        className="mt-2"
        disabled={files.length === 0 || isUploading}
        onClick={() => {
          void onAdd(files).then(() => setFiles([]));
        }}
      >
        {t('gallery.upload.save')}
      </Button>
    </div>
  );
}
