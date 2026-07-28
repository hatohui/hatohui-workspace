import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Calendar,
  Checkbox,
  formatDate,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@hatohui/ui';

type Props = {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  onBirthYearChange: (value: string) => void;
  onBirthMonthChange: (value: string) => void;
  onBirthDayChange: (value: string) => void;
};

const PLACEHOLDER_YEAR = 2000;
const CURRENT_YEAR = new Date().getFullYear();
const FROM_DATE = new Date(CURRENT_YEAR - 120, 0, 1);
const TO_DATE = new Date(CURRENT_YEAR, 11, 31);

function BirthdayFields({
  birthYear,
  birthMonth,
  birthDay,
  onBirthYearChange,
  onBirthMonthChange,
  onBirthDayChange,
}: Props) {
  const { t } = useTranslation();
  const [includeYear, setIncludeYear] = useState(Boolean(birthYear));

  const selected =
    birthMonth && birthDay
      ? new Date(
          birthYear ? Number(birthYear) : PLACEHOLDER_YEAR,
          Number(birthMonth) - 1,
          Number(birthDay),
        )
      : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onBirthMonthChange(String(date.getMonth() + 1));
    onBirthDayChange(String(date.getDate()));
    onBirthYearChange(includeYear ? String(date.getFullYear()) : '');
  };

  const handleIncludeYearChange = (checked: boolean) => {
    setIncludeYear(checked);
    onBirthYearChange(
      checked && selected ? String(selected.getFullYear()) : '',
    );
  };

  return (
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
              ? formatDate(selected, includeYear ? 'PPP' : 'MMMM d')
              : t('friendForm.birthdayPlaceholder')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected ?? new Date(CURRENT_YEAR - 25, 0)}
            startMonth={FROM_DATE}
            endMonth={TO_DATE}
          />
          <div className="flex items-center gap-2 border-t px-3 py-3">
            <Checkbox
              id="includeYear"
              checked={includeYear}
              onCheckedChange={(checked) =>
                handleIncludeYearChange(checked === true)
              }
            />
            <Label htmlFor="includeYear">
              {t('friendForm.includeYearLabel')}
            </Label>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default BirthdayFields;
