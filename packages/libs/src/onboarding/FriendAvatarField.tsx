import { useTranslation } from '@hatohui/i18n';
import { AvatarUploadInline } from '@hatohui/ui';
import { SignImageDtoContentType } from '@hatohui/models';

const AVATAR_ACCEPT = Object.values(SignImageDtoContentType).join(',');

type Props = {
  alt: string;
  previewUrl: string | null;
  isBusy: boolean;
  error: 'unauthorized' | 'unknown' | null;
  onFileSelected: (file: File) => void;
};

function FriendAvatarField({
  alt,
  previewUrl,
  isBusy,
  error,
  onFileSelected,
}: Props) {
  const { t } = useTranslation();

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
        onFileSelected={onFileSelected}
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
    </div>
  );
}

export default FriendAvatarField;
