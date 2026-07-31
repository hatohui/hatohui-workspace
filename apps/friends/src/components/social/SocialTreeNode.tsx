import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { Avatar, cn, Popover, PopoverAnchor, PopoverContent } from '@hatohui/ui';
import { useTranslation } from '@hatohui/i18n';
import type { FriendDto } from '@hatohui/models';
import routes from '../../constants/routes';

type Props = {
  friend: FriendDto;
  parentName: string | null;
  size: 'md' | 'sm';
  style: CSSProperties;
  className?: string;
};

function SocialTreeNode({ friend, parentName, size, style, className }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const dimension = size === 'md' ? 'size-12' : 'size-9';

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
          style={style}
          className={cn(
            'absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full no-underline transition-transform hover:scale-105',
            className,
          )}
        >
          <Avatar src={friend.avatarUrl} alt={friend.name} className={dimension} />
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
            {parentName && (
              <p className="text-xs text-muted-foreground">
                {t('social.friendOfLabel', { via: parentName })}
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default SocialTreeNode;
