import { NavLink } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import {
  Avatar,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@hatohui/ui';
import { useAdminKey } from '../../hooks/useAdminKey';

function AccountMenu() {
  const { t } = useTranslation('workspace');
  const { user, logout } = useAuth();
  const { clear } = useAdminKey();

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border-t border-border p-4 text-left hover:bg-accent"
        >
          <Avatar src={user.avatarUrl} alt={user.name} className="h-8 w-8" />
          <span className="truncate text-sm font-medium">{user.name}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        <NavLink
          to="/settings"
          className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
        >
          {t('nav.settings')}
        </NavLink>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            clear();
            void logout();
          }}
        >
          {t('adminGate.logout')}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default AccountMenu;
