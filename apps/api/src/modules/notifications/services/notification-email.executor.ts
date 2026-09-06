import { Injectable } from '@nestjs/common';
import { ProcessType } from '@prisma/client';
import { Database } from '@/infra/db';
import type { ProcessExecutor } from '@/modules/process-queue/process-queue.constants';
import { NOTIFICATION_EMAIL_MAX_AGE_MS } from '@/modules/notifications/notifications.constants';
import { NotificationEmailService } from '@/modules/notifications/services/notification-email.service';

@Injectable()
export class NotificationEmailExecutor implements ProcessExecutor {
  readonly type = ProcessType.NOTIFICATION_EMAIL;

  constructor(
    private readonly db: Database,
    private readonly notificationEmail: NotificationEmailService,
  ) {}

  async execute(notificationId: string): Promise<void> {
    const notification = await this.db.notification.findUnique({
      where: { id: notificationId },
      select: { createdAt: true },
    });
    if (!notification) return;
    if (
      Date.now() - notification.createdAt.getTime() >
      NOTIFICATION_EMAIL_MAX_AGE_MS
    ) {
      return;
    }

    const result = await this.notificationEmail.deliver(notificationId);
    if (result === 'queued') {
      throw new Error('Email provider out of capacity; will retry');
    }
  }
}
