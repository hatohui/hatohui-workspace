import { useTranslation } from '@hatohui/i18n';
import { AvatarUpload } from '@hatohui/ui';
import { getErrorCategory, useImageUpload } from '@hatohui/libs';
import { SignImageDtoContentType } from '@hatohui/models';

const AVATAR_ACCEPT = Object.values(SignImageDtoContentType).join(',');

type Props = {
  alt: string;
  avatarUrl: string | null;
  onUploaded: (result: { key: string; publicUrl: string }) => void;
};

function FriendAvatarField({ alt, avatarUrl, onUploaded }: Props) {
  const { t } = useTranslation();
  const { uploadImage, isUploading } = useImageUpload();

  const handleFileSelected = async (file: File) => {
    try {
      const uploaded = await uploadImage(file);
      onUploaded(uploaded);
    } catch (error) {
      window.alert(
        getErrorCategory(error) === 'unauthorized'
          ? t('friendForm.avatarUploadAuthRequired')
          : t('friendForm.avatarUploadError'),
      );
    }
  };

  return (
    <AvatarUpload
      imageUrl={avatarUrl}
      alt={alt}
      accept={AVATAR_ACCEPT}
      isUploading={isUploading}
      uploadLabel={t(
        isUploading
          ? 'friendForm.avatarUploading'
          : 'friendForm.avatarUploadLabel',
      )}
      onFileSelected={(file) => void handleFileSelected(file)}
    />
  );
}

export default FriendAvatarField;
