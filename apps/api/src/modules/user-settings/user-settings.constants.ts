import { AppScope } from '@prisma/client';

export const USER_SETTING_TYPES = {
  birthdayReminderLeadDays: {
    scope: AppScope.FRIENDS,
    type: 'friends.birthday.reminderleaddays',
  },
  birthdayRemindersEnabled: {
    scope: AppScope.FRIENDS,
    type: 'friends.birthday.remindersenabled',
  },
  commissionCurrency: {
    scope: AppScope.ART,
    type: 'art.commission.currency',
  },
  commissionRushFee: {
    scope: AppScope.ART,
    type: 'art.commission.rushfee',
  },
  commissionAutoAccept: {
    scope: AppScope.ART,
    type: 'art.commission.autoaccept',
  },
  commissionPaymentMethods: {
    scope: AppScope.ART,
    type: 'art.commission.paymentmethods',
  },
  commissionNotificationEmail: {
    scope: AppScope.ART,
    type: 'art.commission.notificationemail',
  },
} as const;
