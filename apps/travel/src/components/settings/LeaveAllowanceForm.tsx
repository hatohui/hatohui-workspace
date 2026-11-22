import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import { CheckCircle2 } from 'lucide-react';
import type { useLeaveSettingsForm } from '../../hooks/useLeaveSettingsForm';
import FormCardSkeleton from '../shared/FormCardSkeleton';

type LeaveAllowanceFormProps = ReturnType<typeof useLeaveSettingsForm>;

function LeaveAllowanceForm(props: LeaveAllowanceFormProps) {
  const { t } = useTranslation();

  if (props.isLoading) {
    return <FormCardSkeleton />;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void props.save();
      }}
      className="max-w-xl space-y-5 rounded-xl border border-border bg-card p-5"
    >
      <div>
        <h2 className="text-base font-medium">{t('settings.leave.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('settings.leave.description')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="leave-title">{t('settings.leave.jobTitle')}</Label>
        <Input
          id="leave-title"
          value={props.title}
          placeholder={t('settings.leave.jobTitlePlaceholder')}
          onChange={(e) => props.setTitle(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="annual-days">{t('settings.leave.annualDays')}</Label>
          <Input
            id="annual-days"
            type="number"
            min={0}
            max={365}
            value={props.daysOfLeave}
            onChange={(e) => props.setDaysOfLeave(Number(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sick-days">{t('settings.leave.sickDays')}</Label>
          <Input
            id="sick-days"
            type="number"
            min={0}
            max={365}
            value={props.daysOfSickLeave}
            onChange={(e) =>
              props.setDaysOfSickLeave(Number(e.target.value) || 0)
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cycle-start">{t('settings.leave.cycleStart')}</Label>
        <Input
          id="cycle-start"
          type="date"
          value={props.leaveCycleStart}
          onChange={(e) => props.setLeaveCycleStart(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button type="submit" disabled={props.isSaving}>
          {props.isSaving
            ? t('settings.leave.saving')
            : t('settings.leave.save')}
        </Button>
        {props.profile && (
          <Button
            type="button"
            variant="outline"
            disabled={props.isConfirming}
            onClick={() => void props.confirmCycle()}
          >
            <CheckCircle2 className="size-4" aria-hidden />
            {t('settings.leave.confirm')}
          </Button>
        )}
        {props.profile && (
          <span className="text-xs text-muted-foreground">
            {t('settings.leave.confirmedAt', {
              date: props.profile.updatedAt.slice(0, 10),
            })}
          </span>
        )}
      </div>
    </form>
  );
}

export default LeaveAllowanceForm;
