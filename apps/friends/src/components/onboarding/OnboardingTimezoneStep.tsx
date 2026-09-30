import { useMemo, useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Label, SearchableSelect } from '@hatohui/ui';
import { timezoneOptions } from '@hatohui/libs';

type Props = {
  initialTimezone: string;
  submitting: boolean;
  onSubmit: (timezone: string) => void;
};

function OnboardingTimezoneStep({
  initialTimezone,
  submitting,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const [timezone, setTimezone] = useState(initialTimezone);
  const options = useMemo(() => timezoneOptions(timezone), [timezone]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">{t('onboarding.timezone.title')}</h2>
      <p className="text-sm text-muted-foreground">
        {t('onboarding.timezone.description')}
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="onboarding-timezone">
          {t('onboarding.timezone.label')}
        </Label>
        <SearchableSelect
          id="onboarding-timezone"
          value={timezone}
          options={options}
          placeholder={t('onboarding.timezone.label')}
          searchPlaceholder={t('onboarding.timezone.search')}
          emptyLabel={t('onboarding.timezone.empty')}
          onChange={setTimezone}
        />
      </div>
      <Button
        disabled={submitting}
        onClick={() => onSubmit(timezone)}
        className="w-fit"
      >
        {t('common:onboarding.next')}
      </Button>
    </div>
  );
}

export default OnboardingTimezoneStep;
