import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

type Props = {
  onFinish: () => void;
  submitting: boolean;
};

function OnboardingCompleteStep({ onFinish, submitting }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">{t('common:onboarding.complete.title')}</h2>
      <Button disabled={submitting} className="w-fit" onClick={onFinish}>
        {t('common:onboarding.complete.cta')}
      </Button>
    </div>
  );
}

export default OnboardingCompleteStep;
