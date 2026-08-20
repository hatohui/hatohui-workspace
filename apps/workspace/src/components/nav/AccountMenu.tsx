import { NavLink } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import {
  Avatar,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from '@hatohui/ui';
import { navIcons } from '../../constants/navIcons';
import { useAdminKey } from '../../hooks/useAdminKey';

interface AccountMenuProps {
  collapsed: boolean;
}

function AccountMenu({ collapsed }: AccountMenuProps) {
  const { t } = useTranslation('workspace');
  const { user, logout } = useAuth();
  const { clear } = useAdminKey();
  const LogoutIcon = navIcons.logout;

  if (!user) return null;

  const profile = (
    <NavLink
      to="/settings"
      aria-label={user.name}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent',
        collapsed && 'justify-center px-2',
      )}
    >
      <Avatar
        src={user.avatarUrl}
        alt={user.name}
        className="size-6 shrink-0"
      />
      {!collapsed && (
        <span className="truncate text-sm font-medium">{user.name}</span>
      )}
    </NavLink>
  );

  const logoutButton = (
    <button
      type="button"
      aria-label={t('adminGate.logout')}
      onClick={() => {
        clear();
        void logout();
      }}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10',
        collapsed && 'justify-center px-2',
      )}
    >
      <LogoutIcon className="size-4 shrink-0" />
      {!collapsed && <span>{t('adminGate.logout')}</span>}
    </button>
  );

  if (!collapsed) {
    return (
      <div className="flex flex-col gap-1 border-t border-border p-2">
        {profile}
        {logoutButton}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 border-t border-border p-2">
      <Tooltip>
        <TooltipTrigger asChild>{profile}</TooltipTrigger>
        <TooltipContent side="right">{user.name}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>{logoutButton}</TooltipTrigger>
        <TooltipContent side="right">{t('adminGate.logout')}</TooltipContent>
      </Tooltip>
    </div>
  );
}

export default AccountMenu;
