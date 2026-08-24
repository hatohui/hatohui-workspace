'use client';

import { useTranslation } from '@hatohui/i18n';
import { Input, Label } from '@hatohui/ui';

export function UploadLinkFields({
  linkUrl,
  onLinkUrlChange,
  linkFilename,
  onLinkFilenameChange,
}: {
  linkUrl: string;
  onLinkUrlChange: (value: string) => void;
  linkFilename: string;
  onLinkFilenameChange: (value: string) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <>
      <div>
        <Label htmlFor="link-url">{t('gallery.upload.linkLabel')}</Label>
        <Input
          id="link-url"
          placeholder={t('gallery.upload.linkPlaceholder')}
          value={linkUrl}
          onChange={(event) => onLinkUrlChange(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="link-filename">
          {t('gallery.upload.linkFilenameLabel')}
        </Label>
        <Input
          id="link-filename"
          value={linkFilename}
          onChange={(event) => onLinkFilenameChange(event.target.value)}
        />
      </div>
    </>
  );
}
