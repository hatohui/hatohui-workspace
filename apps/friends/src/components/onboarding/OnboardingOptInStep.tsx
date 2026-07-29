import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

type Props = {
  onAnswer: (join: boolean) => void;
  submitting: boolean;
};

function OnboardingOptInStep({ onAnswer, submitting }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-medium">{t('onboarding.optIn.question')}</h2>
      <p className="text-sm text-muted-foreground">
        {t('onboarding.optIn.note')}
      </p>
      <div className="flex gap-2">
        <Button disabled={submitting} onClick={() => onAnswer(true)}>
          {t('onboarding.optIn.yes')}
        </Button>
        <Button
          variant="outline"
          disabled={submitting}
          onClick={() => onAnswer(false)}
        >
          {t('onboarding.optIn.no')}
        </Button>
      </div>
    </div>
  );
}

export default OnboardingOptInStep;
