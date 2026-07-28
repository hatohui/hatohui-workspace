import { CalendarIcon } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { formatDate } from '@hatohui/tools';
import {
  Button,
  Calendar,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
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
const PLACEHOLDER_YEAR = 2000;
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

  const selected =
    birthMonth && birthDay
      ? new Date(PLACEHOLDER_YEAR, Number(birthMonth) - 1, Number(birthDay))
      : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onBirthMonthChange(String(date.getMonth() + 1));
    onBirthDayChange(String(date.getDate()));
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="birthday">{t('friendForm.birthdayLabel')}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="birthday"
              type="button"
              variant="outline"
              className="w-full justify-start font-normal"
            >
              <CalendarIcon className="size-4" />
              {selected
                ? formatDate(selected, 'dd/MM')
                : t('friendForm.birthdayPlaceholder')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              captionLayout="label"
              formatters={{ formatCaption: (date) => formatDate(date, 'LLLL') }}
              selected={selected}
              onSelect={handleSelect}
              defaultMonth={selected ?? new Date(PLACEHOLDER_YEAR, 0)}
            />
          </PopoverContent>
        </Popover>
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
