import { useTranslation } from '@hatohui/i18n';
import type { CreateTravelParticipationDtoLeaveType } from '@hatohui/models';
import { Button, Input, Label } from '@hatohui/ui';
import type { useCreateTravelPlanForm } from '../../hooks/useTravelPlans';

type PlanCreateFormProps = ReturnType<typeof useCreateTravelPlanForm>;

const LEAVE_TYPES: CreateTravelParticipationDtoLeaveType[] = [
  'ANNUAL',
  'SICK',
  'UNPAID',
];

function PlanCreateForm(props: PlanCreateFormProps) {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void props.submit();
      }}
      className="max-w-xl space-y-5 rounded-xl border border-border bg-card p-5"
    >
      <h1 className="text-xl font-semibold">{t('plans.form.title')}</h1>

      <div className="space-y-1.5">
        <Label htmlFor="plan-event">{t('plans.form.event')}</Label>
        <select
          id="plan-event"
          value={props.eventId}
          onChange={(e) => props.setEventId(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
        >
          <option value="">{t('plans.form.noEvent')}</option>
          {props.events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title} ({ev.startAt.slice(0, 10)})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="plan-name">{t('plans.form.groupName')}</Label>
        <Input
          id="plan-name"
          value={props.groupName}
          placeholder={t('plans.form.groupNamePlaceholder')}
          onChange={(e) => props.setGroupName(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="plan-from">{t('plans.form.from')}</Label>
          <Input
            id="plan-from"
            type="datetime-local"
            required
            value={props.from}
            onChange={(e) => props.setFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="plan-to">{t('plans.form.to')}</Label>
          <Input
            id="plan-to"
            type="datetime-local"
            required
            value={props.to}
            onChange={(e) => props.setTo(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="plan-leave">{t('plans.form.leaveType')}</Label>
          <select
            id="plan-leave"
            value={props.leaveType}
            onChange={(e) =>
              props.setLeaveType(
                e.target.value as CreateTravelParticipationDtoLeaveType,
              )
            }
            className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
          >
            {LEAVE_TYPES.map((lt) => (
              <option key={lt} value={lt}>
                {t(`plans.leaveType.${lt}`)}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 pt-6 text-sm">
          <input
            type="checkbox"
            checked={props.isAlreadyHere}
            onChange={(e) => props.setIsAlreadyHere(e.target.checked)}
          />
          <span>{t('plans.form.isAlreadyHere')}</span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="plan-entry">{t('plans.form.entryFlight')}</Label>
          <Input
            id="plan-entry"
            value={props.entryFlight}
            placeholder="VN123"
            onChange={(e) => props.setEntryFlight(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="plan-exit">{t('plans.form.exitFlight')}</Label>
          <Input
            id="plan-exit"
            value={props.exitFlight}
            placeholder="VN124"
            onChange={(e) => props.setExitFlight(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" disabled={props.isSaving}>
        {props.isSaving ? t('plans.form.saving') : t('plans.form.submit')}
      </Button>
    </form>
  );
}

export default PlanCreateForm;
