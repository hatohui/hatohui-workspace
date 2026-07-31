import { useState } from 'react';
import { Link } from 'react-router';
import { Avatar, Popover, PopoverAnchor, PopoverContent } from '@hatohui/ui';
import { useTranslation } from '@hatohui/i18n';
import type { FriendDto } from '@hatohui/models';
import { formatBirthday } from '@hatohui/tools';
import routes from '../constants/routes';

type Props = {
  friend: FriendDto;
  year: number;
};

function CalendarBirthdayEntry({ friend, year }: Props) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const date =
    friend.birthMonth !== null && friend.birthDay !== null
      ? formatBirthday(
          `2000-${String(friend.birthMonth).padStart(2, '0')}-${String(friend.birthDay).padStart(2, '0')}`,
          i18n.language,
        )
      : null;
  const turningAge =
    friend.birthYear !== null ? year - friend.birthYear : null;

  // Hover (desktop) opens the preview, so a click that follows a hover
  // navigates straight through. Without hover (touch), the first tap only
  // opens the preview; a second tap on an already-open preview navigates.
  const handleClick = (e: React.MouseEvent) => {
    if (!open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Link
          to={routes.friend(friend.id)}
          aria-label={friend.name}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={handleClick}
          className="flex w-full items-center gap-1 truncate rounded bg-card px-0.5 py-px no-underline hover:bg-card-hover sm:px-1 sm:py-0.5"
        >
          <Avatar
            src={friend.avatarUrl}
            alt={friend.name}
            className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5"
          />
          <span className="hidden truncate text-xs sm:inline">
            {friend.name}
          </span>
        </Link>
      </PopoverAnchor>
      <PopoverContent
        className="w-56 p-3"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2">
          <Avatar
            src={friend.avatarUrl}
            alt={friend.name}
            className="size-9 shrink-0"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{friend.name}</p>
            {date && (
              <p className="text-xs text-muted-foreground">
                {turningAge !== null
                  ? t('dashboard.turningAge', { age: turningAge, date })
                  : date}
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default CalendarBirthdayEntry;
