'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import { MultiImageUploadField } from '@/components/shared/MultiImageUploadField';

export function OrderReferenceUploader({
  references,
  onAdd,
  isUploading,
}: {
  references: string[];
  onAdd: (files: File[], urls?: string[]) => Promise<unknown>;
  isUploading: boolean;
}) {
  const { t } = useTranslation('art');
  const [files, setFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState('');

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

      <div className="mt-3">
        <Label htmlFor="reference-link">{t('orders.addLinkLabel')}</Label>
        <Input
          id="reference-link"
          placeholder={t('orders.addLinkPlaceholder')}
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.target.value)}
        />
      </div>

      <Button
        size="sm"
        className="mt-2"
        disabled={(files.length === 0 && !linkUrl.trim()) || isUploading}
        onClick={() => {
          const urls = linkUrl.trim() ? [linkUrl.trim()] : [];
          void onAdd(files, urls).then(() => {
            setFiles([]);
            setLinkUrl('');
          });
        }}
      >
        {files.length > 0 ? t('gallery.upload.save') : t('orders.addLink')}
      </Button>
    </div>
  );
}
