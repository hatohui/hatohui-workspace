import { useTranslation } from '@hatohui/i18n';
import { useAvatarHistory } from '../hooks/useAvatarHistory';

type Props = {
  friendId: string;
  onRestored: (avatarUrl: string) => void;
};

function AvatarHistoryGallery({ friendId, onRestored }: Props) {
  const { t } = useTranslation();
  const { versions, isLoading, restore, isRestoring } =
    useAvatarHistory(friendId);

  if (isLoading || versions.length === 0) {
    return null;
  }

  const handleRestore = async (versionId: string) => {
    try {
      const result = await restore(versionId);
      if (result.data.avatarUrl) {
        onRestored(result.data.avatarUrl);
      }
    } catch {
      window.alert(t('friendForm.avatarHistoryRestoreError'));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {t('friendForm.avatarHistoryTitle')}
      </p>
      <div className="flex flex-wrap gap-2">
        {versions.map((version) => (
          <button
            key={version.id}
            type="button"
            disabled={isRestoring}
            onClick={() => void handleRestore(version.id)}
            aria-label={t('friendForm.avatarHistoryRestoreAria')}
            className="size-14 shrink-0 overflow-hidden rounded-full border border-border transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            <img
              src={version.url}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default AvatarHistoryGallery;
