import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import type { FriendDto } from '@hatohui/models';
import { formatBirthday } from '@hatohui/tools';
import routes from '../../constants/routes';

type Props = {
  entry: FriendDto;
};

function ProfileEntryDetails({ entry }: Props) {
  const { t, i18n } = useTranslation();
  const socialMedias =
    (entry.socialMedias as Record<string, string> | null) ?? {};

  const birthday =
    entry.birthMonth !== null && entry.birthDay !== null
      ? formatBirthday(
          `2000-${String(entry.birthMonth).padStart(2, '0')}-${String(entry.birthDay).padStart(2, '0')}`,
          i18n.language,
        )
      : null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-4">
      {birthday && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {t('friendForm.birthdayLabel')}
          </span>
          <span>
            {birthday}
            {entry.birthYear !== null ? ` (${entry.birthYear.toString()})` : ''}
          </span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {t('friendForm.visibilityLabel')}
        </span>
        <span>{t(`friendForm.visibilityOptions.${entry.visibility}`)}</span>
      </div>
      {Object.entries(socialMedias).length > 0 && (
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">
            {t('friendForm.socialMediaLabel')}
          </span>
          {Object.entries(socialMedias).map(([platform, handle]) => (
            <span key={platform}>
              {platform}: {handle}
            </span>
          ))}
        </div>
      )}
      <Button asChild variant="default" className="mt-2 w-fit">
        <Link to={routes.editFriend(entry.id)}>
          {t('friendDetail.editAction')}
        </Link>
      </Button>
    </div>
  );
}

export default ProfileEntryDetails;
