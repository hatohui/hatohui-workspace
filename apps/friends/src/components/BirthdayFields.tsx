import { useTranslation } from '@hatohui/i18n';
import { Input, Label } from '@hatohui/ui';

type Props = {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  onBirthYearChange: (value: string) => void;
  onBirthMonthChange: (value: string) => void;
  onBirthDayChange: (value: string) => void;
};

function BirthdayFields({
  birthYear,
  birthMonth,
  birthDay,
  onBirthYearChange,
  onBirthMonthChange,
  onBirthDayChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="birthMonth">{t('friendForm.birthMonthLabel')}</Label>
        <Input
          id="birthMonth"
          type="number"
          min={1}
          max={12}
          value={birthMonth}
          onChange={(e) => onBirthMonthChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="birthDay">{t('friendForm.birthDayLabel')}</Label>
        <Input
          id="birthDay"
          type="number"
          min={1}
          max={31}
          value={birthDay}
          onChange={(e) => onBirthDayChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="birthYear">{t('friendForm.birthYearLabel')}</Label>
        <Input
          id="birthYear"
          type="number"
          value={birthYear}
          onChange={(e) => onBirthYearChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default BirthdayFields;
