import { Injectable, Logger } from '@nestjs/common';
import { AppScope } from '@prisma/client';
import { Database } from '@/libs/db';

export const BIRTHDAY_CONFIG_TYPES = {
  reminderDays: 'friends.birthday.reminderdays',
  dailySendCap: 'friends.birthday.dailysendcap',
  senderEmail: 'friends.birthday.senderemail',
  senderName: 'friends.birthday.sendername',
  avatarUrl: 'friends.birthday.avatarurl',
} as const;

export interface BirthdaySender {
  email: string;
  name: string;
}

export interface BirthdayConfig {
  reminderDays: number | null;
  dailySendCap: number | null;
  sender: BirthdaySender | null;
  avatarUrl: string | null;
}

@Injectable()
export class BirthdayConfigService {
  private readonly logger = new Logger(BirthdayConfigService.name);

  constructor(private readonly db: Database) {}

  async load(): Promise<BirthdayConfig> {
    const rows = await this.db.appConfig.findMany({
      where: {
        scope: AppScope.FRIENDS,
        type: { startsWith: 'friends.birthday.' },
      },
      select: { type: true, value: true },
    });
    const values = new Map(rows.map((row) => [row.type, row.value]));

    const senderEmail = values.get(BIRTHDAY_CONFIG_TYPES.senderEmail);
    const senderName = values.get(BIRTHDAY_CONFIG_TYPES.senderName);

    return {
      reminderDays: this.positiveInt(
        values.get(BIRTHDAY_CONFIG_TYPES.reminderDays),
        BIRTHDAY_CONFIG_TYPES.reminderDays,
      ),
      dailySendCap: this.positiveInt(
        values.get(BIRTHDAY_CONFIG_TYPES.dailySendCap),
        BIRTHDAY_CONFIG_TYPES.dailySendCap,
      ),
      sender:
        senderEmail && senderName
          ? { email: senderEmail, name: senderName }
          : null,
      avatarUrl: values.get(BIRTHDAY_CONFIG_TYPES.avatarUrl) ?? null,
    };
  }

  private positiveInt(value: string | undefined, type: string): number | null {
    if (value === undefined) {
      this.logger.warn(`AppConfig ${type} is not set`);
      return null;
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      this.logger.warn(
        `Ignoring AppConfig ${type}: expected a positive integer, got "${value}"`,
      );
      return null;
    }
    return parsed;
  }
}
