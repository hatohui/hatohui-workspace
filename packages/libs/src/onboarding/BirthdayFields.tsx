import { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronsUpDown, X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { formatDate } from '@hatohui/tools';
import {
  Button,
  Calendar,
  Input,
  Label,
  Popover,
  PopoverAnchor,
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

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = search
    ? YEARS.filter((y) => String(y).startsWith(search))
    : YEARS;

  const selected =
    birthMonth && birthDay
      ? new Date(PLACEHOLDER_YEAR, Number(birthMonth) - 1, Number(birthDay))
      : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onBirthMonthChange(String(date.getMonth() + 1));
    onBirthDayChange(String(date.getDate()));
  };

  const selectYear = (year: string) => {
    onBirthYearChange(year);
    setOpen(false);
    setSearch('');
  };

  const clearYear = () => {
    onBirthYearChange('');
    setSearch('');
  };

  // Scroll the selected year into view when the popover opens
  useEffect(() => {
    if (open && birthYear && listRef.current) {
      const el = listRef.current.querySelector(
        `[data-year="${birthYear}"]`,
      ) as HTMLElement | null;
      el?.scrollIntoView({ block: 'nearest' });
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, birthYear]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Birthday (month + day) */}
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

      {/* Birth year — searchable combobox */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="birthYear">{t('friendForm.birthYearLabel')}</Label>
        <div className="flex items-center gap-1.5">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverAnchor asChild>
              <Button
                id="birthYear"
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
                onClick={() => setOpen((v) => !v)}
              >
                <span className={birthYear ? '' : 'text-muted-foreground'}>
                  {birthYear || t('friendForm.birthYearLabel')}
                </span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverAnchor>
            <PopoverContent
              className="w-[--radix-popover-trigger-width] p-0"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="flex flex-col">
                <div className="border-b p-2">
                  <Input
                    ref={inputRef}
                    placeholder={t('friendForm.birthYearSearch')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (filtered.length > 0)
                          selectYear(String(filtered[0]));
                      } else if (e.key === 'Escape') {
                        setOpen(false);
                      }
                    }}
                    className="h-8 border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <div ref={listRef} className="max-h-48 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      {t('friendForm.birthYearEmpty')}
                    </p>
                  ) : (
                    filtered.map((year) => (
                      <button
                        key={year}
                        type="button"
                        data-year={String(year)}
                        onClick={() => selectYear(String(year))}
                        className={
                          'flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground' +
                          (birthYear === String(year)
                            ? ' bg-accent font-medium text-accent-foreground'
                            : '')
                        }
                      >
                        {year}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {birthYear && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              onClick={clearYear}
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
