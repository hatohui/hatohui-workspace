import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import { Plus, Trash2 } from 'lucide-react';
import { HOLIDAY_COUNTRIES } from '../../constants/schedule';
import type { useHolidaySettings } from '../../hooks/useHolidaySettings';
import FormCardSkeleton from '../shared/FormCardSkeleton';

type HolidaysFormProps = ReturnType<typeof useHolidaySettings>;

function HolidaysForm(props: HolidaysFormProps) {
  const { t } = useTranslation();

  if (props.isLoading) {
    return <FormCardSkeleton />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className="space-y-3 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="text-base font-medium">
            {t('settings.holidays.countryTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('settings.holidays.countryDescription')}
          </p>
        </div>
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="holiday-country">
            {t('settings.holidays.country')}
          </Label>
          <select
            id="holiday-country"
            value={props.country}
            disabled={props.isUpdatingCountry}
            onChange={(e) => void props.setCountry(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
          >
            {HOLIDAY_COUNTRIES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label} ({item.code})
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="text-base font-medium">
            {t('settings.holidays.customTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('settings.holidays.customDescription')}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void props.addCustomHoliday();
          }}
          className="grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end"
        >
          <div className="space-y-1.5">
            <Label htmlFor="custom-date">{t('settings.holidays.date')}</Label>
            <Input
              id="custom-date"
              type="date"
              value={props.newDate}
              onChange={(e) => props.setNewDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="custom-name">{t('settings.holidays.name')}</Label>
            <Input
              id="custom-name"
              value={props.newName}
              placeholder={t('settings.holidays.namePlaceholder')}
              onChange={(e) => props.setNewName(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={
              !props.newDate || !props.newName.trim() || props.isAddingCustom
            }
          >
            <Plus className="size-4" aria-hidden />
            {t('settings.holidays.add')}
          </Button>
        </form>

        {props.customHolidays.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('settings.holidays.noCustom')}
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {props.customHolidays.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium tabular-nums">{item.date}</span>
                  <span>{item.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('settings.workSchedule.remove')}
                  onClick={() => void props.removeCustomHoliday(item.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-medium">
          {t('settings.holidays.publicTitle', { year: props.year })}
        </h2>
        {props.publicHolidays.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('settings.holidays.noPublic')}
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {props.publicHolidays.map((item) => (
              <li
                key={`${item.date}-${item.name}`}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <span className="font-medium tabular-nums">{item.date}</span>
                <span className="text-right text-muted-foreground">
                  {item.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default HolidaysForm;
