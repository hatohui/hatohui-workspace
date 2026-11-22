import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { AvatarUploadInline, ImageCropDialog } from '@hatohui/ui';
import { SignImageDtoContentType } from '@hatohui/models';

const AVATAR_ACCEPT = Object.values(SignImageDtoContentType).join(',');

type Props = {
  alt: string;
  previewUrl: string | null;
  isBusy: boolean;
  error: 'unauthorized' | 'unknown' | null;
  onFileSelected: (file: File) => void;
};

function AvatarField({
  alt,
  previewUrl,
  isBusy,
  error,
  onFileSelected,
}: Props) {
  const { t } = useTranslation();
  const [cropFile, setCropFile] = useState<File | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <AvatarUploadInline
        imageUrl={previewUrl}
        alt={alt}
        accept={AVATAR_ACCEPT}
        label={t(
          isBusy
            ? 'common:avatarField.uploading'
            : 'common:avatarField.uploadLabel',
        )}
        isUploading={isBusy}
        onFileSelected={setCropFile}
      />
      {error != null && (
        <p role="alert" className="text-sm text-destructive">
          {t(
            error === 'unauthorized'
              ? 'common:avatarField.uploadAuthRequired'
              : 'common:avatarField.uploadError',
          )}
        </p>
      )}
      <ImageCropDialog
        open={Boolean(cropFile)}
        file={cropFile}
        aspect={1}
        shape="circle"
        aspectLabel={t('common:avatarField.cropAspect')}
        title={t('common:avatarField.cropTitle')}
        hint={t('common:avatarField.cropHint')}
        cancelLabel={t('common:avatarField.cropCancel')}
        confirmLabel={t('common:avatarField.cropApply')}
        zoomLabel={t('common:avatarField.cropZoom')}
        resetLabel={t('common:avatarField.cropReset')}
        onCancel={() => setCropFile(null)}
        onConfirm={(cropped) => {
          onFileSelected(cropped);
          setCropFile(null);
        }}
      />
    </div>
  );
}

export default AvatarField;
