import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { Card, CardContent } from '@hatohui/ui';
import type { UpcomingFriendDto } from '@hatohui/models';
import routes from '../constants/routes';

type Props = {
  friend: UpcomingFriendDto;
};

function BirthdayCard({ friend }: Props) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <Link
          to={routes.friend(friend.id)}
          className="font-medium hover:text-primary"
        >
          {friend.name}
        </Link>
        {friend.turningAge !== null ? (
          <span className="text-sm text-muted-foreground">
            {t('dashboard.turningAge', { age: friend.turningAge })}
          </span>
        ) : (
          <time className="text-sm text-muted-foreground">
            {friend.nextBirthdayDate}
          </time>
        )}
      </CardContent>
    </Card>
  );
}

export default BirthdayCard;
