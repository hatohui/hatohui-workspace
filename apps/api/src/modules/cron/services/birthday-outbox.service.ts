import { Injectable } from '@nestjs/common';
import { EmailOutboxStatus, Prisma } from '@prisma/client';
import { Database } from '@/infra/db';
import { MAX_ATTEMPTS } from '@/modules/cron/birthday.constants';

const CLAIMED_ROW = {
  id: true,
  kind: true,
  subjectId: true,
  occursOn: true,
  attempts: true,
  recipient: {
    select: {
      id: true,
      email: true,
      name: true,
      profile: { select: { displayName: true } },
    },
  },
} as const;

export type ClaimedEmail = Prisma.EmailOutboxGetPayload<{
  select: typeof CLAIMED_ROW;
}>;

@Injectable()
export class BirthdayOutboxService {
  constructor(private readonly db: Database) {}

  enqueue(
    rows: Prisma.EmailOutboxCreateManyInput[],
  ): Promise<{ count: number }> {
    return this.db.emailOutbox.createMany({ data: rows, skipDuplicates: true });
  }

  sentToday(): Promise<number> {
    return this.db.emailOutbox.count({
      where: {
        status: EmailOutboxStatus.SENT,
        sentAt: { gte: startOfUtcDay() },
      },
    });
  }

  async claim(limit: number): Promise<ClaimedEmail[]> {
    if (limit <= 0) return [];

    const claimed = await this.db.$queryRaw<{ id: string }[]>`
      UPDATE "EmailOutbox"
      SET status = 'SENDING', "claimedAt" = now()
      WHERE id IN (
        SELECT id
        FROM "EmailOutbox"
        WHERE status = 'PENDING'
        ORDER BY "createdAt" ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id
    `;

    if (claimed.length === 0) return [];

    return this.db.emailOutbox.findMany({
      where: { id: { in: claimed.map((row) => row.id) } },
      select: CLAIMED_ROW,
    });
  }

  markSent(id: string): Promise<unknown> {
    return this.db.emailOutbox.update({
      where: { id },
      data: {
        status: EmailOutboxStatus.SENT,
        sentAt: new Date(),
        claimedAt: null,
        lastError: null,
      },
    });
  }

  markFailed(row: ClaimedEmail, error: unknown): Promise<unknown> {
    const attempts = row.attempts + 1;
    return this.db.emailOutbox.update({
      where: { id: row.id },
      data: {
        status:
          attempts < MAX_ATTEMPTS
            ? EmailOutboxStatus.PENDING
            : EmailOutboxStatus.FAILED,
        attempts,
        claimedAt: null,
        lastError: describe(error),
      },
    });
  }

  async release(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const { count } = await this.db.emailOutbox.updateMany({
      where: { id: { in: ids } },
      data: { status: EmailOutboxStatus.PENDING, claimedAt: null },
    });
    return count;
  }

  async deleteSentBefore(cutoff: Date): Promise<number> {
    const { count } = await this.db.emailOutbox.deleteMany({
      where: { status: EmailOutboxStatus.SENT, sentAt: { lt: cutoff } },
    });
    return count;
  }
}

function startOfUtcDay(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function describe(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, 500);
}
