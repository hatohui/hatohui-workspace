import { useTranslation } from '@hatohui/i18n';
import { AvatarUploadInline } from '@hatohui/ui';
import {
  getErrorCategory,
  resizeImageToSquare,
  useImageUpload,
} from '@hatohui/libs';
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
      const squared = await resizeImageToSquare(file);
      const uploaded = await uploadImage(squared);
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
    <AvatarUploadInline
      imageUrl={avatarUrl}
      alt={alt}
      accept={AVATAR_ACCEPT}
      label={t(
        isUploading
          ? 'friendForm.avatarUploading'
          : 'friendForm.avatarUploadLabel',
      )}
      isUploading={isUploading}
      onFileSelected={(file) => void handleFileSelected(file)}
    />
  );
}

export default FriendAvatarField;
