import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import VisibilityField from '../VisibilityField';
import type { Visibility } from '../../constants/visibility';

type Props = {
  initialVisibility: Visibility;
  onSubmit: (visibility: Visibility) => void;
  submitting: boolean;
};

function OnboardingVisibilityStep({
  initialVisibility,
  onSubmit,
  submitting,
}: Props) {
  const { t } = useTranslation();
  const [visibility, setVisibility] = useState(initialVisibility);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-medium">
        {t('onboarding.visibility.title')}
      </h2>
      <VisibilityField value={visibility} onChange={setVisibility} />
      <Button
        disabled={submitting}
        onClick={() => onSubmit(visibility)}
        className="w-fit"
      >
        {t('onboarding.next')}
      </Button>
    </div>
  );
}

export default OnboardingVisibilityStep;
