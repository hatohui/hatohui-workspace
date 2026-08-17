import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import { useAuth, getErrorCategory } from '@hatohui/libs';
import { useUpdateMe } from '@hatohui/models';

const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

function ProfileSettingsForm() {
  const { t } = useTranslation();
  const { user, refetchUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [handle, setHandle] = useState(user?.handle ?? '');
  const updateMe = useUpdateMe();

  if (!user) return null;

  const trimmedHandle = handle.trim().toLowerCase();
  const isHandleValid =
    trimmedHandle.length === 0 || HANDLE_PATTERN.test(trimmedHandle);
  const trimmedName = name.trim();
  const isDirty =
    trimmedName !== user.name || trimmedHandle !== (user.handle ?? '');

  const handleSubmit = () => {
    updateMe.mutate(
      {
        data: { displayName: trimmedName, handle: trimmedHandle || undefined },
      },
      { onSuccess: () => void refetchUser() },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-name">{t('settings.profile.nameLabel')}</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-handle">
          {t('settings.profile.handleLabel')}
        </Label>
        <Input
          id="profile-handle"
          value={handle}
          placeholder={t('settings.profile.handlePlaceholder')}
          onChange={(event) => setHandle(event.target.value)}
        />
        {!isHandleValid && (
          <p role="alert" className="text-sm text-destructive">
            {t('settings.profile.handleInvalid')}
          </p>
        )}
        {updateMe.error != null && (
          <p role="alert" className="text-sm text-destructive">
            {t(`common:errors.${getErrorCategory(updateMe.error)}`)}
          </p>
        )}
      </div>
      <Button
        size="sm"
        className="w-fit"
        disabled={
          !isDirty ||
          !isHandleValid ||
          trimmedName.length === 0 ||
          updateMe.isPending
        }
        onClick={handleSubmit}
      >
        {t('settings.profile.save')}
      </Button>
    </div>
  );
}

export default ProfileSettingsForm;
