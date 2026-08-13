import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import BirthdayFields from './BirthdayFields';

type Props = {
  onSubmit: (data: {
    birthYear?: number;
    birthMonth: number;
    birthDay: number;
  }) => void;
  submitting: boolean;
};

function OnboardingBirthdayStep({ onSubmit, submitting }: Props) {
  const { t } = useTranslation();
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  const canSubmit = birthMonth !== '' && birthDay !== '';

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">{t('common:onboarding.birthday.title')}</h2>
      <BirthdayFields
        birthYear={birthYear}
        birthMonth={birthMonth}
        birthDay={birthDay}
        onBirthYearChange={setBirthYear}
        onBirthMonthChange={setBirthMonth}
        onBirthDayChange={setBirthDay}
      />
      <Button
        disabled={submitting || !canSubmit}
        className="w-fit"
        onClick={() =>
          onSubmit({
            birthYear: birthYear ? Number(birthYear) : undefined,
            birthMonth: Number(birthMonth),
            birthDay: Number(birthDay),
          })
        }
      >
        {t('common:onboarding.next')}
      </Button>
    </div>
  );
}

export default OnboardingBirthdayStep;
