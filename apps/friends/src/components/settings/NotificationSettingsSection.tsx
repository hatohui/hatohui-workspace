import { useTranslation } from '@hatohui/i18n';
import { Checkbox, Label } from '@hatohui/ui';
import {
  MAX_BIRTHDAY_REMINDER_DAYS_BEFORE,
  MAX_BIRTHDAY_REMINDER_WEEKS_BEFORE,
  MIN_BIRTHDAY_REMINDER_DAYS_BEFORE,
  MIN_BIRTHDAY_REMINDER_WEEKS_BEFORE,
} from '../../constants/birthdayReminders';
import { useBirthdayReminderOffsets } from '../../hooks/useBirthdayReminderOffsets';
import ReminderOffsetField from './ReminderOffsetField';

function NotificationSettingsSection() {
  const { t } = useTranslation();
  const {
    daysBefore,
    weeksBefore,
    isEnabled,
    isReady,
    setDaysBefore,
    setWeeksBefore,
    setEnabled,
  } = useBirthdayReminderOffsets();

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-sans text-sm font-medium">
          {t('settings.notifications.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('settings.notifications.description')}
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="reminders-enabled"
          checked={isEnabled}
          disabled={!isReady}
          onCheckedChange={(checked) => setEnabled(checked === true)}
        />
        <Label
          htmlFor="reminders-enabled"
          className="cursor-pointer text-sm font-normal"
        >
          {t('settings.notifications.enabledLabel')}
        </Label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ReminderOffsetField
          id="reminder-days-before"
          label={t('settings.notifications.daysBeforeLabel')}
          hint={t('settings.notifications.daysBeforeHint')}
          value={daysBefore}
          min={MIN_BIRTHDAY_REMINDER_DAYS_BEFORE}
          max={MAX_BIRTHDAY_REMINDER_DAYS_BEFORE}
          disabled={!isReady || !isEnabled}
          onChange={setDaysBefore}
        />
        <ReminderOffsetField
          id="reminder-weeks-before"
          label={t('settings.notifications.weeksBeforeLabel')}
          hint={t('settings.notifications.weeksBeforeHint')}
          value={weeksBefore}
          min={MIN_BIRTHDAY_REMINDER_WEEKS_BEFORE}
          max={MAX_BIRTHDAY_REMINDER_WEEKS_BEFORE}
          disabled={!isReady || !isEnabled}
          onChange={setWeeksBefore}
        />
      </div>

      {!isEnabled && isReady && (
        <p className="text-sm text-muted-foreground">
          {t('settings.notifications.allOff')}
        </p>
      )}
    </section>
  );
}

export default NotificationSettingsSection;
