import { AppScope } from '@prisma/client';

export const USER_SETTING_TYPES = {
  birthdayReminderLeadDays: {
    scope: AppScope.FRIENDS,
    type: 'friends.birthday.reminderleaddays',
  },
} as const;
