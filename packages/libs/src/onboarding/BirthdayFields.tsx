import { useState } from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { formatDate, parseDate } from '@hatohui/tools';
import {
  Button,
  Calendar,
  Input,
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

const DATE_FORMAT = 'dd/MM';

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

  const [dateText, setDateText] = useState(
    selected ? formatDate(selected, DATE_FORMAT) : '',
  );
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const syncText = (date: Date | undefined) => {
    setDateText(date ? formatDate(date, DATE_FORMAT) : '');
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onBirthMonthChange(String(date.getMonth() + 1));
    onBirthDayChange(String(date.getDate()));
    syncText(date);
    setDatePopoverOpen(false);
  };

  // Masks input to digits-only "dd/mm", inserting the slash automatically
  // so users can't type anything the format doesn't allow.
  const maskDateInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleDateTextChange = (raw: string) => {
    const masked = maskDateInput(raw);
    setDateText(masked);

    const digits = masked.replace(/\D/g, '');
    if (digits.length < 4) return;

    const parsed = parseDate(
      masked,
      DATE_FORMAT,
      new Date(PLACEHOLDER_YEAR, 0, 1),
    );
    if (parsed) {
      onBirthMonthChange(String(parsed.getMonth() + 1));
      onBirthDayChange(String(parsed.getDate()));
    }
  };

  const commitDateText = () => {
    const digits = dateText.replace(/\D/g, '');
    if (digits.length === 0) {
      onBirthMonthChange('');
      onBirthDayChange('');
      return;
    }
    const parsed =
      digits.length === 4
        ? parseDate(dateText, DATE_FORMAT, new Date(PLACEHOLDER_YEAR, 0, 1))
        : undefined;
    syncText(parsed ?? selected);
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="birthday">{t('friendForm.birthdayLabel')}</Label>
        <div className="relative">
          <Input
            id="birthday"
            value={dateText}
            placeholder="dd/mm"
            inputMode="numeric"
            onChange={(event) => handleDateTextChange(event.target.value)}
            onBlur={commitDateText}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitDateText();
              }
            }}
            className="pr-8"
          />
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1.5 size-6 -translate-y-1/2 text-muted-foreground"
              >
                <CalendarIcon className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                captionLayout="label"
                fixedWeeks
                formatters={{
                  formatCaption: (date) => formatDate(date, 'LLLL'),
                }}
                selected={selected}
                onSelect={handleSelect}
                defaultMonth={selected ?? new Date(PLACEHOLDER_YEAR, 0)}
              />
            </PopoverContent>
          </Popover>
        </div>
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
