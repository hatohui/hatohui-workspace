import { useTranslation } from '@hatohui/i18n';

type Props = {
  socialMedias: Record<string, string>;
};

function FriendDetailInfo({ socialMedias }: Props) {
  const { t } = useTranslation();
  const entries = Object.entries(socialMedias);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-4">
      <h2 className="text-sm font-medium text-muted-foreground">
        {t('friendForm.socialMediaLabel')}
      </h2>
      <ul className="flex flex-col gap-1">
        {entries.map(([platform, handle]) => (
          <li key={platform} className="text-sm">
            <span className="font-medium">{platform}:</span> {handle}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FriendDetailInfo;
