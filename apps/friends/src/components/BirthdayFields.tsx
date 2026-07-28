import { useTranslation } from '@hatohui/i18n';
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';

type Props = {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  onBirthYearChange: (value: string) => void;
  onBirthMonthChange: (value: string) => void;
  onBirthDayChange: (value: string) => void;
};

const NO_YEAR = 'none';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 120 }, (_, i) => CURRENT_YEAR - i);

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
        <Select
          value={birthMonth || undefined}
          onValueChange={(value) => onBirthMonthChange(value)}
        >
          <SelectTrigger id="birthMonth">
            <SelectValue placeholder={t('friendForm.birthMonthLabel')} />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month, index) => (
              <SelectItem key={month} value={String(index + 1)}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="birthDay">{t('friendForm.birthDayLabel')}</Label>
        <Select
          value={birthDay || undefined}
          onValueChange={(value) => onBirthDayChange(value)}
        >
          <SelectTrigger id="birthDay">
            <SelectValue placeholder={t('friendForm.birthDayLabel')} />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((day) => (
              <SelectItem key={day} value={String(day)}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="birthYear">{t('friendForm.birthYearLabel')}</Label>
        <Select
          value={birthYear || NO_YEAR}
          onValueChange={(value) =>
            onBirthYearChange(value === NO_YEAR ? '' : value)
          }
        >
          <SelectTrigger id="birthYear">
            <SelectValue placeholder={t('friendForm.birthYearLabel')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_YEAR}>—</SelectItem>
            {YEARS.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default BirthdayFields;
