import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import { Plus, Trash2 } from 'lucide-react';
import { WEEKDAY_KEYS } from '../../constants/schedule';
import type { useWorkScheduleSettings } from '../../hooks/useWorkScheduleSettings';
import FormCardSkeleton from '../shared/FormCardSkeleton';

type WorkScheduleFormProps = ReturnType<typeof useWorkScheduleSettings>;

function WorkScheduleForm(props: WorkScheduleFormProps) {
  const { t } = useTranslation();

  if (props.isLoading) {
    return <FormCardSkeleton />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="text-base font-medium">
            {t('settings.workSchedule.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('settings.workSchedule.description')}
          </p>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {WEEKDAY_KEYS.map((key) => {
            const active = props.days[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => props.toggleDay(key)}
                className={[
                  'rounded-lg border py-2.5 text-center text-sm font-medium transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted',
                ].join(' ')}
              >
                {t(`schedule.weekdays.${key}`)}
              </button>
            );
          })}
        </div>

        <Button
          disabled={props.isSavingSchedule}
          onClick={() => void props.saveSchedule()}
        >
          {props.isSavingSchedule
            ? t('settings.workSchedule.saving')
            : t('settings.workSchedule.save')}
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="text-base font-medium">
            {t('settings.workSchedule.exceptionsTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('settings.workSchedule.exceptionsDescription')}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void props.addException();
          }}
          className="grid gap-3 sm:grid-cols-[150px_160px_1fr_auto] sm:items-end"
        >
          <div className="space-y-1.5">
            <Label htmlFor="ex-date">{t('settings.workSchedule.date')}</Label>
            <Input
              id="ex-date"
              type="date"
              value={props.exceptionDate}
              onChange={(e) => props.setExceptionDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ex-type">{t('settings.workSchedule.type')}</Label>
            <select
              id="ex-type"
              value={props.exceptionIsWorkDay ? 'work' : 'off'}
              onChange={(e) =>
                props.setExceptionIsWorkDay(e.target.value === 'work')
              }
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
            >
              <option value="off">
                {t('settings.workSchedule.forcedOff')}
              </option>
              <option value="work">
                {t('settings.workSchedule.forcedWork')}
              </option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ex-reason">
              {t('settings.workSchedule.reason')}
            </Label>
            <Input
              id="ex-reason"
              value={props.exceptionReason}
              placeholder={t('settings.workSchedule.reasonPlaceholder')}
              onChange={(e) => props.setExceptionReason(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={!props.exceptionDate || props.isAddingException}
          >
            <Plus className="size-4" aria-hidden />
            {t('settings.workSchedule.addException')}
          </Button>
        </form>

        {props.exceptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('settings.workSchedule.noExceptions')}
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {props.exceptions.map((ex) => (
              <li
                key={ex.id}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium tabular-nums">{ex.date}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {ex.isWorkDay
                      ? t('settings.workSchedule.forcedWork')
                      : t('settings.workSchedule.forcedOff')}
                  </span>
                  {ex.reason && (
                    <span className="text-muted-foreground">{ex.reason}</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('settings.workSchedule.remove')}
                  onClick={() => void props.removeException(ex.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default WorkScheduleForm;
