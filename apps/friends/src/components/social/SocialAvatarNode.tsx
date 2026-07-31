import { Link } from 'react-router';
import { Avatar, Tooltip, TooltipContent, TooltipTrigger } from '@hatohui/ui';
import type { FriendDto } from '@hatohui/models';
import routes from '../../constants/routes';

interface Props {
  friend: FriendDto;
  label: string;
  size?: 'md' | 'sm';
}

function SocialAvatarNode({ friend, label, size = 'md' }: Props) {
  const dimension = size === 'md' ? 'h-12 w-12' : 'h-9 w-9';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={routes.friend(friend.id)}
          aria-label={label}
          className="flex shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105"
        >
          <Avatar
            src={friend.avatarUrl}
            alt={friend.name}
            className={dimension}
          />
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default SocialAvatarNode;
