import { Injectable, Logger } from '@nestjs/common';
import {
  EmailOutboxKind,
  FriendVisibility,
  NotificationType,
  Prisma,
} from '@prisma/client';
import { Database } from '@/libs/db';
import { EmailService, isRateLimitError } from '@/libs/email';
import { ConnectionsService } from '@/modules/connections/connections.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { renderBirthdayEmail } from './birthday-email-templates';
import {
  BIRTHDAY_CONFIG_TYPES,
  BirthdayConfigService,
  type BirthdayConfig,
} from './birthday-config';
import {
  BirthdayOutboxService,
  SENT_RETENTION_DAYS,
  type ClaimedEmail,
} from './birthday-outbox.service';
import {
  civilDateIn,
  formatCivilDateLong,
  nextOccurrence,
  toUtcDate,
  type CivilDate,
} from './birthday-schedule';
import {
  BirthdayCleanupDto,
  BirthdayEvaluationDto,
  BirthdayProcessingDto,
} from './dto/birthday-cron.dto';

const OWNED_BIRTHDAY = {
  profile: {
    select: {
      id: true,
      displayName: true,
      handle: true,
      user: { select: { id: true, timezone: true } },
    },
  },
} as const;

type OwnedBirthday = Prisma.BirthdayGetPayload<{
  include: typeof OWNED_BIRTHDAY;
}>;

@Injectable()
export class BirthdayCronService {
  private readonly logger = new Logger(BirthdayCronService.name);

  constructor(
    private readonly db: Database,
    private readonly config: BirthdayConfigService,
    private readonly outbox: BirthdayOutboxService,
    private readonly connections: ConnectionsService,
    private readonly notifications: NotificationsService,
    private readonly email: EmailService,
  ) {}

  async evaluate(): Promise<BirthdayEvaluationDto> {
    const config = await this.config.load();
    const birthdays = await this.db.birthday.findMany({
      where: { profile: { userId: { not: null } } },
      include: OWNED_BIRTHDAY,
    });

    const now = new Date();
    const rows: Prisma.EmailOutboxCreateManyInput[] = [];
    const celebrations: Celebration[] = [];
    let due = 0;

    for (const birthday of birthdays) {
      const derived = await this.reminderRowsFor(birthday, now, config);
      if (derived.outbox.length === 0) continue;
      due += 1;
      rows.push(...derived.outbox);
      if (derived.celebration) celebrations.push(derived.celebration);
    }

    const { count } = await this.outbox.enqueue(rows);
    const notified = await this.announce(celebrations);

    return {
      examined: birthdays.length,
      due,
      queued: count,
      alreadyQueued: rows.length - count,
      notified,
    };
  }

  async process(): Promise<BirthdayProcessingDto> {
    const config = await this.config.load();

    if (!config.sender) {
      this.logger.warn(
        `${BIRTHDAY_CONFIG_TYPES.senderEmail}/${BIRTHDAY_CONFIG_TYPES.senderName} not set; nothing sent`,
      );
      return this.summary({ remainingBudget: 0 });
    }
    const sender = config.sender;

    if (config.dailySendCap === null) {
      this.logger.warn(
        `${BIRTHDAY_CONFIG_TYPES.dailySendCap} not set; nothing sent`,
      );
      return this.summary({ remainingBudget: 0 });
    }

    const budget = config.dailySendCap - (await this.outbox.sentToday());

    if (budget <= 0) {
      this.logger.warn(
        `Daily send cap of ${config.dailySendCap} reached; deferring to the next run`,
      );
      return this.summary({ remainingBudget: 0 });
    }

    const claimed = await this.outbox.claim(budget);
    if (claimed.length === 0) return this.summary({ remainingBudget: budget });

    const subjects = await this.loadSubjects(claimed);

    let sent = 0;
    let failed = 0;
    let rateLimited = false;
    const unhandled: string[] = [];

    for (const [index, row] of claimed.entries()) {
      const subject = subjects.get(row.subjectId);

      if (subject === undefined) {
        unhandled.push(row.id);
        continue;
      }

      const { subject: emailSubject, html } = renderBirthdayEmail(
        row.kind,
        templateParams(row, subject, config.avatarUrl),
      );

      try {
        await this.email.send({
          to: [{ email: row.recipient.email, name: row.recipient.name }],
          sender,
          subject: emailSubject,
          htmlContent: html,
        });
        await this.outbox.markSent(row.id);
        sent += 1;
      } catch (error) {
        if (isRateLimitError(error)) {
          rateLimited = true;
          unhandled.push(...claimed.slice(index).map((rest) => rest.id));
          this.logger.warn(
            `Provider rate limit hit after ${sent} sends; releasing ${claimed.length - index} rows for the next run`,
          );
          break;
        }
        await this.outbox.markFailed(row, error);
        failed += 1;
        this.logger.error(
          `Failed to send ${row.kind} to ${row.recipient.id}`,
          error instanceof Error ? error.stack : error,
        );
      }
    }

    const released = await this.outbox.release(unhandled);
    if (released > 0 && !rateLimited) {
      this.logger.warn(
        `Released ${released} row(s) with a missing subject profile`,
      );
    }

    return this.summary({
      claimed: claimed.length,
      sent,
      failed,
      released,
      rateLimited,
      remainingBudget: budget - sent,
    });
  }

  async cleanup(): Promise<BirthdayCleanupDto> {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - SENT_RETENTION_DAYS);
    return { deleted: await this.outbox.deleteSentBefore(cutoff) };
  }

  private async reminderRowsFor(
    birthday: OwnedBirthday,
    now: Date,
    config: BirthdayConfig,
  ): Promise<DerivedReminders> {
    const owner = birthday.profile.user;
    if (!owner) return { outbox: [] };

    const today = civilDateIn(now, owner.timezone);
    const { daysUntil, occursOn } = nextOccurrence(
      today,
      birthday.month,
      birthday.day,
    );

    const isReminderDay = daysUntil === config.reminderDays;
    const isBirthday = daysUntil === 0;
    if (!isReminderDay && !isBirthday) return { outbox: [] };

    const base = {
      subjectId: birthday.profile.id,
      occursOn: toUtcDate(occursOn),
    };
    const outbox: Prisma.EmailOutboxCreateManyInput[] = [];

    if (isBirthday) {
      outbox.push({
        ...base,
        kind: EmailOutboxKind.SELF_BIRTHDAY,
        recipientId: owner.id,
      });
    }

    if (birthday.visibility === FriendVisibility.NONE) return { outbox };

    const kind = isBirthday
      ? EmailOutboxKind.FRIEND_BIRTHDAY_TODAY
      : EmailOutboxKind.FRIEND_BIRTHDAY_UPCOMING;
    const { connectedUserIds } = await this.connections.getContext(owner.id);

    for (const recipientId of connectedUserIds) {
      outbox.push({ ...base, kind, recipientId });
    }

    if (!isBirthday || connectedUserIds.size === 0) return { outbox };

    return {
      outbox,
      celebration: {
        subjectId: birthday.profile.id,
        actorId: owner.id,
        occursOn: toUtcDate(occursOn),
        recipientIds: [...connectedUserIds],
      },
    };
  }

  /// The bell counterpart to FRIEND_BIRTHDAY_TODAY. Last year's row for the
  /// same pair is dropped first so this year's arrives at the top of the feed
  /// unread; within the day, re-runs find the row already there and leave it
  /// alone rather than marking it unread again every hour.
  private async announce(celebrations: Celebration[]): Promise<number> {
    if (celebrations.length === 0) return 0;

    await Promise.all(
      celebrations.map((celebration) =>
        this.db.notification.deleteMany({
          where: {
            type: NotificationType.BIRTHDAY_REMINDER,
            subjectId: celebration.subjectId,
            createdAt: { lt: previousOccurrenceCutoff(celebration.occursOn) },
          },
        }),
      ),
    );

    const { count } = await this.db.notification.createMany({
      skipDuplicates: true,
      data: celebrations.flatMap((celebration) =>
        celebration.recipientIds.map((recipientId) => ({
          recipientId,
          actorId: celebration.actorId,
          type: NotificationType.BIRTHDAY_REMINDER,
          subjectId: celebration.subjectId,
        })),
      ),
    });

    if (count > 0) {
      await this.notifications.invalidateUnread(
        ...celebrations.flatMap((celebration) => celebration.recipientIds),
      );
    }

    return count;
  }

  private async loadSubjects(claimed: ClaimedEmail[]) {
    const profiles = await this.db.profile.findMany({
      where: { id: { in: [...new Set(claimed.map((row) => row.subjectId))] } },
      select: {
        id: true,
        displayName: true,
        handle: true,
        avatarUrl: true,
        birthday: { select: { year: true } },
        user: { select: { timezone: true } },
      },
    });
    return new Map(profiles.map((profile) => [profile.id, profile]));
  }

  private summary(
    overrides: Partial<BirthdayProcessingDto> &
      Pick<BirthdayProcessingDto, 'remainingBudget'>,
  ): BirthdayProcessingDto {
    return {
      claimed: 0,
      sent: 0,
      failed: 0,
      released: 0,
      rateLimited: false,
      ...overrides,
    };
  }
}

interface Celebration {
  subjectId: string;
  actorId: string;
  occursOn: Date;
  recipientIds: string[];
}

interface DerivedReminders {
  outbox: Prisma.EmailOutboxCreateManyInput[];
  celebration?: Celebration;
}

/// Half a year back from this occurrence: later than last year's row, earlier
/// than anything created for this one.
function previousOccurrenceCutoff(occursOn: Date): Date {
  const cutoff = new Date(occursOn);
  cutoff.setUTCDate(cutoff.getUTCDate() - 183);
  return cutoff;
}

type Subject = {
  displayName: string;
  handle: string | null;
  avatarUrl: string | null;
  birthday: { year: number | null } | null;
  user: { timezone: string } | null;
};

function templateParams(
  row: ClaimedEmail,
  subject: Subject,
  defaultAvatarUrl: string | null,
) {
  const occursOn = utcDateToCivil(row.occursOn);
  const timezone = subject.user?.timezone ?? 'UTC';

  return {
    recipientName: row.recipient.profile?.displayName ?? row.recipient.name,
    friendName: subject.displayName,
    friendHandle: subject.handle,
    friendAvatarUrl: subject.avatarUrl ?? defaultAvatarUrl,
    subjectId: row.subjectId,
    birthdayDate: formatCivilDateLong(occursOn),
    birthdayTimezone: timezone,
    turningAge: subject.birthday?.year
      ? occursOn.year - subject.birthday.year
      : null,
  };
}

function utcDateToCivil(date: Date): CivilDate {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}
