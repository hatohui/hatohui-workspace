import { CalendarIcon, X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { formatDate } from '@hatohui/tools';
import {
  Button,
  Calendar,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SearchableSelect,
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
const YEAR_OPTIONS = Array.from({ length: 120 }, (_, index) => {
  const year = String(CURRENT_YEAR - index);
  return { value: year, label: year };
});

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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        <div className="relative">
          <SearchableSelect
            id="birthYear"
            value={birthYear || null}
            options={YEAR_OPTIONS}
            placeholder={t('friendForm.birthYearLabel')}
            searchPlaceholder={t('friendForm.birthYearSearch')}
            emptyLabel={t('friendForm.birthYearEmpty')}
            onChange={onBirthYearChange}
            className={birthYear ? 'pr-16' : undefined}
          />

          {birthYear && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-7 size-6 -translate-y-1/2"
              onClick={() => onBirthYearChange('')}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BirthdayFields;
