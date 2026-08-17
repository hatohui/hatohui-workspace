import { useTranslation } from '@hatohui/i18n';
import { Checkbox, Label } from '@hatohui/ui';
import {
  BIRTHDAY_REMINDER_LABEL_KEYS,
  BIRTHDAY_REMINDER_LEAD_DAYS,
} from '../../constants/birthdayReminders';
import { useBirthdayReminders } from '../../hooks/useBirthdayReminders';

function NotificationSettingsSection() {
  const { t } = useTranslation();
  const { selected, isReady, toggle } = useBirthdayReminders();

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

      <ul className="flex flex-col gap-2">
        {BIRTHDAY_REMINDER_LEAD_DAYS.map((leadDay) => (
          <li key={leadDay} className="flex items-center gap-2.5">
            <Checkbox
              id={`reminder-${leadDay}`}
              checked={selected.includes(leadDay)}
              disabled={!isReady}
              onCheckedChange={() => toggle(leadDay)}
            />
            <Label
              htmlFor={`reminder-${leadDay}`}
              className="cursor-pointer text-sm font-normal"
            >
              {t(BIRTHDAY_REMINDER_LABEL_KEYS[leadDay])}
            </Label>
          </li>
        ))}
      </ul>

      {selected.length === 0 && isReady && (
        <p className="text-sm text-muted-foreground">
          {t('settings.notifications.allOff')}
        </p>
      )}
    </section>
  );
}

export default NotificationSettingsSection;
