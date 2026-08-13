import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import { useStagedAvatar } from '../../hooks/useStagedAvatar';
import FriendAvatarField from '../FriendAvatarField';

type Props = {
  initialName: string;
  initialAvatarUrl: string | null;
  onSubmit: (name: string, avatarKey?: string) => void;
  submitting: boolean;
};

function OnboardingProfileStep({
  initialName,
  initialAvatarUrl,
  onSubmit,
  submitting,
}: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const avatar = useStagedAvatar(initialAvatarUrl);

  const handleSubmit = async () => {
    let avatarKey: string | undefined;
    try {
      avatarKey = await avatar.commit();
    } catch {
      return;
    }
    onSubmit(name.trim(), avatarKey);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">{t('onboarding.profile.title')}</h2>
      <FriendAvatarField
        alt={name || t('onboarding.profile.nameLabel')}
        previewUrl={avatar.previewUrl}
        isBusy={avatar.isBusy}
        error={avatar.error}
        onFileSelected={(file) => void avatar.stageFile(file)}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="onboarding-profile-name">
          {t('onboarding.profile.nameLabel')}
        </Label>
        <Input
          id="onboarding-profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <Button
        disabled={submitting || avatar.isBusy || name.trim().length === 0}
        onClick={() => void handleSubmit()}
        className="w-fit"
      >
        {t('onboarding.next')}
      </Button>
    </div>
  );
}

export default OnboardingProfileStep;
