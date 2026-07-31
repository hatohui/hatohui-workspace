import { useTranslation } from '@hatohui/i18n';
import {
  Avatar,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@hatohui/ui';
import { GoogleIcon, useAuth, useGoogleIdentity } from '@hatohui/libs';
import { navIcons } from '../../constants/navIcons';
import NavSlotPlaceholder from './NavSlotPlaceholder';

interface Props {
  expanded: boolean;
}

function SidebarAccount({ expanded }: Props) {
  const { t } = useTranslation();
  const { user, isLoading, logout } = useAuth();
  const { isReady, promptLogin } = useGoogleIdentity();
  const LogoutIcon = navIcons.logout;

  if (isLoading) {
    return (
      <NavSlotPlaceholder className={expanded ? 'h-9 w-full' : 'size-9'} />
    );
  }

  if (!user) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size={expanded ? 'sm' : 'icon'}
            className={`rounded-full ${expanded ? 'w-full justify-start gap-2 rounded-lg px-3' : ''}`}
            disabled={!isReady}
            aria-label={t('common:auth.login')}
            onClick={promptLogin}
          >
            <GoogleIcon />
            {expanded && (
              <span className="text-sm">{t('common:auth.login')}</span>
            )}
          </Button>
        </TooltipTrigger>
        {!expanded && (
          <TooltipContent side="right">
            <p>{t('common:auth.login')}</p>
          </TooltipContent>
        )}
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex h-9 items-center gap-2 rounded-full px-2 ${expanded ? 'rounded-lg' : 'justify-center'}`}
          >
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              className="size-6 shrink-0"
            />
            {expanded && (
              <span className="truncate text-xs text-muted-foreground">
                {user.name}
              </span>
            )}
          </div>
        </TooltipTrigger>
        {!expanded && (
          <TooltipContent side="right">
            <p>{user.name}</p>
          </TooltipContent>
        )}
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size={expanded ? 'sm' : 'icon'}
            className={`rounded-full text-muted-foreground ${expanded ? 'w-full justify-start gap-2 rounded-lg px-3' : ''}`}
            aria-label={t('navigation.logout')}
            onClick={() => void logout()}
          >
            <LogoutIcon className="size-4 shrink-0" />
            {expanded && (
              <span className="text-sm">{t('navigation.logout')}</span>
            )}
          </Button>
        </TooltipTrigger>
        {!expanded && (
          <TooltipContent side="right">
            <p>{t('navigation.logout')}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </>
  );
}

export default SidebarAccount;
