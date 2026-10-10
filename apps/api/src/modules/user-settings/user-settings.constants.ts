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
  commissionPrivateFee: {
    scope: AppScope.ART,
    type: 'art.commission.privatefee',
  },
  commissionRetentionDays: {
    scope: AppScope.ART,
    type: 'art.commission.retentiondays',
  },
  commissionGalleryPostDefault: {
    scope: AppScope.ART,
    type: 'art.commission.gallerypostdefault',
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
  artistAbout: {
    scope: AppScope.ART,
    type: 'art.about',
  },
  notificationEmailEnabled: {
    scope: AppScope.FRIENDS,
    type: 'friends.notifications.emailenabled',
  },
} as const;
