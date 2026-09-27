'use client';

import { useTranslation } from '@hatohui/i18n';
import { useConfirmLogout } from '@hatohui/libs';
import type { UserDto } from '@hatohui/models';
import {
  Avatar,
  Button,
  ConfirmDialog,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@hatohui/ui';

export function AccountMenu({ user }: { user: UserDto }) {
  const { t } = useTranslation('common');
  const { confirming, requestLogout, cancelLogout, confirmLogout } =
    useConfirmLogout();
  const loggedInAs = t('auth.loggedInAs', { name: user.name });

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" aria-label={loggedInAs}>
            <Avatar src={user.avatarUrl} alt={user.name} className="size-8" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-2">
          <p className="px-2 py-1.5 text-sm text-muted-foreground">
            {loggedInAs}
          </p>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={requestLogout}
          >
            {t('auth.logout')}
          </Button>
        </PopoverContent>
      </Popover>
      <ConfirmDialog
        open={confirming}
        title={t('auth.logoutConfirmTitle')}
        description={t('auth.logoutConfirmDescription')}
        cancelLabel={t('auth.logoutConfirmCancel')}
        confirmLabel={t('auth.logoutConfirmSubmit')}
        onCancel={cancelLogout}
        onConfirm={() => void confirmLogout()}
      />
    </>
  );
}
