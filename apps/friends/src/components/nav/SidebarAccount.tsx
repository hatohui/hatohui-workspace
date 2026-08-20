import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import {
  Avatar,
  Button,
  cn,
  ConfirmDialog,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@hatohui/ui';
import {
  GoogleIcon,
  useAuth,
  useConfirmLogout,
  useGoogleAuth,
} from '@hatohui/libs';
import { navIcons } from '../../constants/navIcons';
import routes from '../../constants/routes';
import NavSlotPlaceholder from './NavSlotPlaceholder';

interface Props {
  expanded: boolean;
}

function SidebarAccount({ expanded }: Props) {
  const { t } = useTranslation();
  const { user, isLoading, isLoggingIn } = useAuth();
  const { confirming, requestLogout, cancelLogout, confirmLogout } =
    useConfirmLogout();
  const login = useGoogleAuth();
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
            aria-label={t('common:auth.login')}
            disabled={isLoggingIn}
            onClick={() => login()}
          >
            {isLoggingIn ? <Spinner /> : <GoogleIcon />}
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
      <ConfirmDialog
        open={confirming}
        title={t('common:auth.logoutConfirmTitle')}
        description={t('common:auth.logoutConfirmDescription')}
        cancelLabel={t('common:auth.logoutConfirmCancel')}
        confirmLabel={t('common:auth.logoutConfirmSubmit')}
        onCancel={cancelLogout}
        onConfirm={() => void confirmLogout()}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={routes.account}
            aria-label={t('navigation.account')}
            className={`flex h-9 items-center gap-2 rounded-full px-2 hover:bg-accent ${expanded ? 'rounded-lg' : 'justify-center'}`}
          >
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              className={cn(
                'size-6 shrink-0',
                user.isAdmin && 'ring-primary ring-2',
              )}
            />
            {expanded && (
              <span className="truncate text-xs text-muted-foreground">
                {user.name}
              </span>
            )}
          </Link>
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
            className={`rounded-full text-destructive hover:text-destructive ${expanded ? 'w-full justify-start gap-2 rounded-lg px-3' : ''}`}
            aria-label={t('navigation.logout')}
            onClick={requestLogout}
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
