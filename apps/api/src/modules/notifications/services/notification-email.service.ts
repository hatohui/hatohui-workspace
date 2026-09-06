import { Injectable, Logger } from '@nestjs/common';
import { AppScope } from '@prisma/client';
import { Database } from '@/infra/db';
import { EmailService, isRateLimitError } from '@/infra/email';
import { UserSettingsService } from '@/modules/user-settings/services/user-settings.service';
import { USER_SETTING_TYPES } from '@/modules/user-settings/user-settings.constants';
import {
  EMAILED_NOTIFICATION_TYPES,
  NOTIFICATION_SENDER_CONFIG_TYPES,
} from '@/modules/notifications/notifications.constants';
import { renderNotificationEmail } from '@/modules/notifications/utils/notification-email-templates';

export type NotificationEmailResult = 'sent' | 'queued' | 'skipped';

const NOTIFICATION_FOR_EMAIL = {
  id: true,
  type: true,
  subjectId: true,
  data: true,
  emailedAt: true,
  recipient: {
    select: {
      id: true,
      email: true,
      name: true,
      profile: { select: { displayName: true } },
    },
  },
  actor: {
    select: {
      name: true,
      profile: {
        select: { displayName: true, handle: true, avatarUrl: true },
      },
    },
  },
} as const;

@Injectable()
export class NotificationEmailService {
  private readonly logger = new Logger(NotificationEmailService.name);

  constructor(
    private readonly db: Database,
    private readonly email: EmailService,
    private readonly userSettings: UserSettingsService,
  ) { }

  async deliver(notificationId: string): Promise<NotificationEmailResult> {
    const notification = await this.db.notification.findUnique({
      where: { id: notificationId },
      select: NOTIFICATION_FOR_EMAIL,
    });

    if (!notification || notification.emailedAt) return 'skipped';
    if (!EMAILED_NOTIFICATION_TYPES.has(notification.type)) return 'skipped';

    const optOut = await this.userSettings.get(
      notification.recipient.id,
      USER_SETTING_TYPES.notificationEmailEnabled.scope,
      USER_SETTING_TYPES.notificationEmailEnabled.type,
    );
    if (optOut === 'false') return 'skipped';

    const sender = await this.loadSender();
    if (!sender) {
      this.logger.warn(
        `${NOTIFICATION_SENDER_CONFIG_TYPES.senderEmail}/${NOTIFICATION_SENDER_CONFIG_TYPES.senderName} not set; nothing sent`,
      );
      return 'queued';
    }

    const rendered = renderNotificationEmail(notification.type, {
      recipientName:
        notification.recipient.profile?.displayName ??
        notification.recipient.name,
      actorName:
        notification.actor?.profile?.displayName ??
        notification.actor?.name ??
        null,
      actorHandle: notification.actor?.profile?.handle ?? null,
      actorAvatarUrl: notification.actor?.profile?.avatarUrl ?? null,
      subjectId: notification.subjectId,
      data: asRecord(notification.data),
    });
    if (!rendered) return 'skipped';

    try {
      await this.email.send({
        to: [
          {
            email: notification.recipient.email,
            name: notification.recipient.name,
          },
        ],
        sender,
        subject: rendered.subject,
        htmlContent: rendered.html,
      });
    } catch (error) {
      if (isRateLimitError(error)) return 'queued';
      throw error;
    }

    await this.db.notification.update({
      where: { id: notificationId },
      data: { emailedAt: new Date() },
    });
    return 'sent';
  }

  private async loadSender(): Promise<{ email: string; name: string } | null> {
    const rows = await this.db.systemParameters.findMany({
      where: {
        scope: AppScope.FRIENDS,
        type: {
          in: [
            NOTIFICATION_SENDER_CONFIG_TYPES.senderEmail,
            NOTIFICATION_SENDER_CONFIG_TYPES.senderName,
          ],
        },
      },
      select: { type: true, value: true },
    });
    const values = new Map(rows.map((row) => [row.type, row.value]));
    const email = values.get(NOTIFICATION_SENDER_CONFIG_TYPES.senderEmail);
    const name = values.get(NOTIFICATION_SENDER_CONFIG_TYPES.senderName);
    return email && name ? { email, name } : null;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
