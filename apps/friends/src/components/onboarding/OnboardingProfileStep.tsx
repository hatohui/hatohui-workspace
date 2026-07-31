import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import OnboardingAvatarField from './OnboardingAvatarField';

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
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarKey, setAvatarKey] = useState<string | undefined>(undefined);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">{t('onboarding.profile.title')}</h2>
      <OnboardingAvatarField
        alt={name}
        avatarUrl={avatarUrl}
        onUploaded={(result) => {
          setAvatarUrl(result.publicUrl);
          setAvatarKey(result.key);
        }}
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
        disabled={submitting || name.trim().length === 0}
        onClick={() => onSubmit(name.trim(), avatarKey)}
        className="w-fit"
      >
        {t('onboarding.next')}
      </Button>
    </div>
  );
}

export default OnboardingProfileStep;
