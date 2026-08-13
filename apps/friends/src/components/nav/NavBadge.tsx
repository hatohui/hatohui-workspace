import { UNREAD_BADGE_MAX } from '../../constants/notifications';

type Props = {
  count: number;
};

function NavBadge({ count }: Props) {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-medium text-destructive-foreground">
      {count > UNREAD_BADGE_MAX ? `${UNREAD_BADGE_MAX}+` : count}
    </span>
  );
}

export default NavBadge;
